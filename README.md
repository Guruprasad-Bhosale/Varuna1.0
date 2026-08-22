# 🌊 Sagar Drishti

### AI-Powered River & Coastal Water Intelligence Platform

> A low-cost, edge-to-cloud environmental monitoring system that combines **IoT sensors, Computer Vision, Satellite Data, and Machine Learning** to provide real-time water quality assessment and early environmental risk detection for rivers and coastal ecosystems.

![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat-square&logo=fastapi)
![Angular](https://img.shields.io/badge/Angular-18-DD0031?style=flat-square&logo=angular)
![Raspberry Pi](https://img.shields.io/badge/Raspberry%20Pi-4-C51A4A?style=flat-square&logo=raspberrypi)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Timescale-4169E1?style=flat-square&logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-success?style=flat-square)

---

## 📖 Overview

**Sagar Drishti** is designed to monitor river health through intelligent edge devices deployed along riverbanks. The system periodically collects water samples, analyzes water quality parameters, performs AI-assisted particle screening, and predicts overall environmental risk using a Machine Learning model.

### Key Objectives

- 🌊 Continuous river water monitoring
- 🧪 Automatic water quality assessment
- 🤖 AI-assisted suspended particle screening
- 🛰️ Satellite-enhanced environmental intelligence
- 📲 Real-time dashboard & WhatsApp alerts

---

## 🏗 System Architecture

```text
                River Water
                     │
          Peristaltic Sampling
                     │
        ┌──────────────────────┐
        │  Edge Monitoring Node │
        │ Raspberry Pi + ESP32  │
        └──────────────────────┘
                     │
      pH • TDS • Turbidity • Temp
                     │
          Pi Camera + OpenCV
                     │
        Random Forest ML Engine
                     │
      Water Safety Classification
                     │
  Dashboard • WhatsApp • Analytics
```

---

## ✨ Features

- **Real-time IoT Monitoring** using pH, Turbidity, TDS, Temperature and Water Level sensors
- **AI-assisted Particle Screening** with Raspberry Pi Camera & OpenCV
- **Random Forest Water Safety Prediction**
- **Interactive Angular Dashboard**
- **Historical Trends & GIS Mapping**
- **WhatsApp Alert Integration**
- **Offline-ready Progressive Web App (PWA)**

---

## 🧠 AI Prediction Engine

The prediction engine combines multiple environmental data sources into a single safety score.

### Inputs

| Source              | Parameters                              |
| ------------------- | --------------------------------------- |
| **IoT Sensors**     | pH, Turbidity, TDS, Temperature         |
| **Computer Vision** | Particle Count, Average Size, Shape     |
| **Satellite**       | Chlorophyll-a, SST, Ocean Colour, KD490 |

### Output

- ✅ Safe
- ⚠️ Moderate
- 🔴 Dangerous
- Confidence Score (%)
- Recommended Action

---

## 🔬 Hardware Components

| Component           | Purpose                    |
| ------------------- | -------------------------- |
| Raspberry Pi 4      | Edge AI & Image Processing |
| ESP32 DevKit        | Sensor Acquisition         |
| pH Sensor (PH4502C) | Acidity Measurement        |
| Turbidity Sensor    | Water Clarity              |
| TDS Sensor          | Dissolved Solids           |
| DS18B20             | Water Temperature          |
| Float Switch        | Chamber Water Level        |
| Pi Camera Module 3  | Particle Screening         |
| Peristaltic Pump    | Automatic Sampling         |

---

## 📊 Water Quality Parameters

| Parameter   | Unit | Good Range |
| ----------- | ---- | ---------- |
| pH          | pH   | 6.5 – 8.5  |
| Turbidity   | NTU  | 0 – 10     |
| TDS         | ppm  | 50 – 300   |
| Temperature | °C   | 24 – 29    |

> **Note:** Operational thresholds are prototype ranges derived from WHO/BIS reference guidelines and local calibration.

---

## 🧪 AI-Assisted Particle Screening

Unlike laboratory FTIR systems, Sagar Drishti performs **optical suspended-particle screening**.

### Extracted Features

- Particle Count
- Average Size (mm)
- Shape (Fiber / Fragment / Film / Bead)
- Color Features
- Concentration (particles/L)

The ML model combines these optical features with sensor telemetry to estimate **Particle Contamination Risk**.

---

## 📱 Dashboard Modules

- Live Water Safety Score
- Historical Sensor Trends
- River Node Status
- GIS Monitoring Map
- AI Model Insights
- Device Health Diagnostics
- Alert Center

---

## 🛰 Satellite Intelligence

Satellite observations provide regional environmental context by incorporating:

- Chlorophyll-a
- KD490
- Total Suspended Matter (TSM)
- Sea Surface Temperature
- Ocean Colour Reflectance

These features improve environmental prediction beyond ground sensors alone.

---

## 🛠 Tech Stack

### Frontend

- Angular 18
- Tailwind CSS
- Leaflet GIS
- Apache ECharts
- PWA Service Worker

### Backend

- FastAPI
- Python 3.11
- SQLAlchemy
- PostgreSQL
- Pandas & NumPy
- Scikit-learn
- XGBoost

### Hardware

- Raspberry Pi 4
- ESP32
- Pi Camera Module 3
- Environmental Sensor Array

---

## 📁 Project Structure

```text
Sagar-Drishti/
│
├── backend/
│   ├── api/
│   ├── services/
│   ├── ml/
│   └── models/
│
├── dashboard-angular/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── assets/
│
├── hardware/
│   ├── wiring/
│   ├── enclosure/
│   └── calibration/
│
└── README.md
```

---

## 🚀 Getting Started

### Backend

```bash
cd backend

python -m venv venv
source venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload
```

### Frontend

```bash
cd dashboard-angular

npm install

npm start
```

Frontend: **http://localhost:4200**

Backend API: **http://localhost:8000/docs**

---

## 📡 REST API

### Predict Water Safety

```http
POST /api/v1/ml/predict
```

Example payload:

```json
{
  "ph": 7.4,
  "turbidity": 5.8,
  "ec": 410,
  "temperature": 26.2,
  "chl": 2.1,
  "kd490": 0.14,
  "tsm": 4.8
}
```

Returns:

- Water Safety Score
- Bloom Probability
- ML Risk Tier
- Recommendations
- Confidence

---

## 🌱 Roadmap

- [x] Dashboard UI
- [x] FastAPI Backend
- [x] Random Forest Prediction
- [x] WhatsApp Integration
- [x] Satellite Data Pipeline
- [ ] Raspberry Pi Hardware Integration
- [ ] Sensor Calibration
- [ ] Field Testing (Panchaganga River)
- [ ] Multi-node Deployment

---

## 👥 Contributors

Developed as part of **Capgemini Tech4Positive 2026**.

**Project:** Sagar Drishti — AI-Powered River & Coastal Water Intelligence

---

## 📚 References

- WHO Guidelines for Drinking-water Quality
- BIS IS 10500:2012
- ISRO EOS-06 Ocean Colour Monitor
- Raspberry Pi Camera Module 3 Documentation
- Scikit-learn & XGBoost Documentation

---

## 📄 License

This project is licensed under the **MIT License**.
