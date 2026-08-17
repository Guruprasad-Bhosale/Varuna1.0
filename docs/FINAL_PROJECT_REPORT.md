# Project VARUNA — Academic Project Report & Viva Defense Guide

## Section 1: Abstract & System Overview
**Project VARUNA** is a continuous, automated IoT edge-to-cloud environmental intelligence platform designed to monitor river water quality and predict ecological hazards in real-time. Adhering to Central Pollution Control Board (CPCB) standards for Class C (Drinking water source after conventional treatment) and Class D (Propagation of Wild life and Fisheries) rivers, the system acquires high-fidelity multiparameter physicochemical telemetry (pH, Turbidity, Electrical Conductivity, Temperature). 

To bridge the gap between traditional chemical sensors and macro-pollutant detection, VARUNA utilizes an Edge Computer Vision pipeline (OpenCV) to optically screen for suspended particulate matter and microplastics. Data is persisted via a resilient offline-first SQLite buffer, synchronized to a PostgreSQL cloud backend, and classified by a pre-trained Scikit-Learn Random Forest model. Critical anomalies automatically trigger multi-channel municipal webhooks and Telegram alerts.

---

## Section 2: System Architecture

The VARUNA architecture follows a highly decoupled 3-tier topology:

1. **Tier 1: Embedded Hardware Acquisition**
   - **ESP32 Microcontroller**: Acts as the real-time analog acquisition frontend. It manages a deterministic state machine to control a 12V peristaltic pump for drawing samples into an isolation chamber, allowing sensors to stabilize before sampling.
   - **Sensors**: Analog pH, Turbidity (IR scattering), Electrical Conductivity (Temperature compensated), and DS18B20 digital temperature sensor.

2. **Tier 2: Edge Intelligence & Orchestration**
   - **Raspberry Pi 4 Edge Node**: Connected to the ESP32 via UART, running a Python daemon.
   - **Pi Camera V3**: Executes OpenCV adaptive thresholding to count and measure optical particulates.
   - **Resilience**: Operates an SQLite buffer to queue telemetry during network dropouts, ensuring zero data loss. Local Edge AI inference allows immediate alerting even if disconnected from the cloud.

3. **Tier 3: Cloud Backend & Dashboard**
   - **FastAPI / PostgreSQL Engine**: A containerized 12-Factor app running on an NGINX reverse proxy.
   - **React/Vite Dashboard**: Provides a real-time SPA visualizing Recharts time-series data and React-Leaflet geospatial telemetry.

---

## Section 3: Mathematical Model

VARUNA utilizes a deterministic Water Quality Index (WQI) Sub-index penalty function to calculate a composite `safety_score` (0-100).
Let $P_{param}$ be the penalty for a specific parameter:

$$ WQI = \max(0, 100 - P_{pH} - P_{Turbidity} - P_{EC} - P_{Particles}) $$

Where penalties are piecewise linear or exponential based on CPCB thresholds:
- $P_{pH}$: Penalty grows sharply if pH drops below 6.5 or rises above 8.5.
- $P_{EC}$: Penalty scales linearly as EC exceeds 600 µS/cm.
- $P_{Turbidity}$: Heavy penalty scaling above 10 NTU.

---

## Section 4: ML Methodology & Results

The system utilizes a `RandomForestClassifier` trained on a synthetic dataset of 300 multi-modal river observations. 
- **Validation Strategy**: Stratified 5-Fold Cross Validation.
- **Hyperparameter Constraints**: `max_depth=8`, `min_samples_split=3`, and `class_weight='balanced'` to prevent overfitting on the majority `Safe` class.
- **Why Random Forest?**: River ecosystems exhibit highly non-linear relationships (e.g., pH toxicity spikes exponentially depending on temperature and heavy metal solubility). Random Forest captures these non-linear boundary conditions significantly better than Logistic Regression or SVMs.

---

## Section 5: Hardware & Optical Screening Design

Traditional water sensors cannot detect physical macro-pollutants (plastics, organic debris). VARUNA solves this using a sealed sampling chamber illuminated by a fixed LED.
- **OpenCV Pipeline**: The Pi Camera captures a frame. The image undergoes Gaussian Blurring to remove sensor noise, followed by **Adaptive Gaussian Thresholding** to isolate suspended contours despite variations in ambient water coloration.
- **Measurement**: Contours above a minimum pixel area are mapped to physical sizes using a pre-calibrated Pixel-to-mm ratio ($1px \approx 0.045mm$).

---

## Section 6: Viva Voce & Technical Defense Q&A

**Q1: Why did you use an ESP32 *and* a Raspberry Pi? Why not just one?**
*Answer:* Separation of concerns. The ESP32 lacks the RAM/Processing power to run OpenCV image screening or complex ML inference. However, the Raspberry Pi lacks hardware Analog-to-Digital Converters (ADCs) required for the chemical sensors, and Linux is not a Real-Time Operating System (RTOS), making precise timing for the peristaltic pump unreliable. The ESP32 handles deterministic hardware control, while the Pi handles heavy computation and networking.

**Q2: How does the system handle network loss in remote river locations?**
*Answer:* The edge Python orchestrator uses an "Offline-First" design. Every sample is immediately committed to a local SQLite database (`edge_buffer.db`). A separate background sync worker polls this queue and attempts to flush data to the cloud only when HTTP connectivity is restored.

**Q3: How are the 12V pumps powered without destroying the 3.3V ESP32?**
*Answer:* Total optical isolation via a 5V relay module. Furthermore, inductive loads like motors create high-voltage kickback when turned off. We placed a 1N4007 flyback diode in parallel with the pump to safely dissipate this back-EMF, protecting the microcontroller's logic pins.

**Q4: Why Random Forest instead of a Deep Learning Neural Network?**
*Answer:* Neural Networks require massive amounts of data to avoid overfitting and act as a "black box". For environmental monitoring, explainability is key. Random Forest allows us to extract `Feature Importances` (e.g., knowing that pH contributed 40% to the model's decision). It also trains instantly and runs efficiently on Edge hardware without requiring a GPU.

**Q5: What happens if the FastAPI backend goes down? Does the React Dashboard crash?**
*Answer:* No. The `api.js` Axios client in the React app implements an automatic Mock Fallback mechanism. If an `ECONNREFUSED` or `502 Bad Gateway` error is caught, the frontend gracefully degrades into an "Offline Demo" mode, injecting synthetic JSON telemetry so the dashboard remains functional and visually intact for the user.
