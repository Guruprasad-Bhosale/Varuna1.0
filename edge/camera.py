import os
import cv2
import numpy as np
import logging
from pathlib import Path
from typing import Tuple, Dict, Any

logger = logging.getLogger("VARUNA-CAMERA")

class OpticalParticleScreener:
    def __init__(self, hw_mode: bool = False, pixel_to_mm_ratio: float = 0.045):
        self.hw_mode = hw_mode
        self.pixel_to_mm = pixel_to_mm_ratio  # 1 pixel = ~0.045 mm (calibration constant)
        self.capture_dir = Path(__file__).resolve().parent / "captures"
        self.capture_dir.mkdir(parents=True, exist_ok=True)

    def _generate_synthetic_frame(self) -> np.ndarray:
        """Generates a realistic synthetic optical chamber frame with floating debris."""
        # 640x480 water background with slight gradient
        frame = np.full((480, 640, 3), (220, 215, 200), dtype=np.uint8)
        # Add sensor chamber illumination vignette
        cv2.circle(frame, (320, 240), 280, (245, 240, 230), -1)

        # Randomize particle count
        num_particles = np.random.randint(40, 250)
        for _ in range(num_particles):
            x = np.random.randint(50, 590)
            y = np.random.randint(50, 430)
            radius = np.random.randint(2, 14)
            color = (
                np.random.randint(40, 90),
                np.random.randint(40, 90),
                np.random.randint(40, 90)
            )
            cv2.circle(frame, (x, y), radius, color, -1)

        # Add Gaussian noise
        noise = np.random.normal(0, 8, frame.shape).astype(np.uint8)
        frame = cv2.add(frame, noise)
        return frame

    def capture_and_analyze(self) -> Tuple[Dict[str, Any], str]:
        """Captures frame, extracts particle contours, calculates metric sizes, and saves preview."""
        if self.hw_mode:
            cap = cv2.VideoCapture(0)
            ret, frame = cap.read()
            cap.release()
            if not ret or frame is None:
                logger.warning("Hardware camera capture failed. Falling back to synthetic frame.")
                frame = self._generate_synthetic_frame()
        else:
            frame = self._generate_synthetic_frame()

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (7, 7), 0)

        # Adaptive thresholding to isolate suspended particulate contours
        thresh = cv2.adaptiveThreshold(
            blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY_INV, 15, 3
        )

        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        annotated = frame.copy()
        sizes_mm = []
        min_contour_area = 6  # Ignore single-pixel sensor noise

        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area >= min_contour_area:
                # Calculate equivalent circular diameter
                equivalent_diameter_px = np.sqrt(4 * area / np.pi)
                size_mm = equivalent_diameter_px * self.pixel_to_mm
                sizes_mm.append(size_mm)

                # Draw bounding contour on diagnostic preview
                (x, y, w, h) = cv2.boundingRect(cnt)
                cv2.rectangle(annotated, (x, y), (x + w, y + h), (0, 0, 255), 1)

        particle_count = len(sizes_mm)
        avg_particle_size_mm = round(float(np.mean(sizes_mm)), 3) if particle_count > 0 else 0.0

        # Save diagnostic image
        preview_path = str(self.capture_dir / "latest_screen.jpg")
        cv2.imwrite(preview_path, annotated)

        result = {
            "particle_count": particle_count,
            "avg_particle_size_mm": avg_particle_size_mm
        }
        logger.info("Optical Screening Complete: %d particles detected | Avg Size: %.3f mm", particle_count, avg_particle_size_mm)
        return result, preview_path
