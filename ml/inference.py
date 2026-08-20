import logging
from pathlib import Path
from typing import Dict, Any
import numpy as np
import joblib

logger = logging.getLogger("VARUNA-INFERENCE")

BASE_DIR = Path(__file__).resolve().parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"

class WaterSafetyPredictor:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(WaterSafetyPredictor, cls).__new__(cls)
            cls._instance._load_artifacts()
        return cls._instance

    def _load_artifacts(self):
        self.is_heuristic_fallback = False
        self.features = [
            "ph", "turbidity_ntu", "ec_us_cm", 
            "temperature_c", "particle_count", "avg_particle_size_mm"
        ]
        try:
            self.model = joblib.load(ARTIFACTS_DIR / "water_safety_rf.joblib")
            self.scaler = joblib.load(ARTIFACTS_DIR / "scaler.joblib")
            self.label_encoder = joblib.load(ARTIFACTS_DIR / "label_encoder.joblib")
            logger.info("Predictor initialized with classes: %s", self.label_encoder.classes_)
        except Exception as e:
            logger.warning("Failed to load artifacts from %s: %s. Using heuristic fallback.", ARTIFACTS_DIR, e)
            self.is_heuristic_fallback = True

    def calculate_composite_score(self, data: Dict[str, float]) -> int:
        """Calculates a deterministic 0-100 Water Quality Index baseline."""
        # pH Sub-index (ideal: 7.0 - 7.5)
        ph_penalty = abs(data["ph"] - 7.0) * 15.0
        # Turbidity Sub-index
        turb_penalty = (data["turbidity_ntu"] / 100.0) * 35.0
        # EC Sub-index
        ec_penalty = (data["ec_us_cm"] / 2500.0) * 25.0
        # Particle count Sub-index
        particle_penalty = (data["particle_count"] / 600.0) * 25.0

        total_penalty = ph_penalty + turb_penalty + ec_penalty + particle_penalty
        score = max(0, min(100, int(100 - total_penalty)))
        return score

    def predict(self, raw_features: Dict[str, float]) -> Dict[str, Any]:
        safety_score = self.calculate_composite_score(raw_features)

        if getattr(self, "is_heuristic_fallback", False):
            if safety_score < 45:
                pred_label = "Dangerous"
            elif safety_score < 75:
                pred_label = "Moderate"
            else:
                pred_label = "Safe"
            
            return {
                "prediction": pred_label,
                "confidence_pct": 100.0,
                "safety_score": safety_score,
                "class_probabilities": {"Safe": 100.0 if pred_label == "Safe" else 0.0, "Moderate": 100.0 if pred_label == "Moderate" else 0.0, "Dangerous": 100.0 if pred_label == "Dangerous" else 0.0},
                "is_anomaly": pred_label in ["Moderate", "Dangerous"],
                "alert_level": "CRITICAL" if pred_label == "Dangerous" else ("WARNING" if pred_label == "Moderate" else "INFO")
            }

        feature_vector = np.array([[raw_features[feat] for feat in self.features]])
        scaled_vector = self.scaler.transform(feature_vector)

        probabilities = self.model.predict_proba(scaled_vector)[0]
        pred_idx = int(np.argmax(probabilities))
        pred_label = self.label_encoder.classes_[pred_idx]
        confidence = float(probabilities[pred_idx] * 100)

        prob_dict = {
            self.label_encoder.classes_[i]: round(float(probabilities[i] * 100), 2)
            for i in range(len(self.label_encoder.classes_))
        }

        return {
            "prediction": pred_label,
            "confidence_pct": round(confidence, 2),
            "safety_score": safety_score,
            "class_probabilities": prob_dict,
            "is_anomaly": pred_label in ["Moderate", "Dangerous"],
            "alert_level": "CRITICAL" if pred_label == "Dangerous" else ("WARNING" if pred_label == "Moderate" else "INFO")
        }
