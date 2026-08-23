import logging
from pathlib import Path
from typing import Dict, Any
import numpy as np
import pandas as pd
import joblib
from datetime import datetime

from ml.risk_engine import calculate_nirvaah_risk

logger = logging.getLogger("JalDrishiti-INFERENCE")

BASE_DIR = Path(__file__).resolve().parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"

class WaterSafetyPredictor:
    """
    Renamed logically to NirvaahPredictor style, but keeping the class name 
    WaterSafetyPredictor for compatibility with main.py and telemetry.py imports.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(WaterSafetyPredictor, cls).__new__(cls)
            cls._instance._load_artifacts()
        return cls._instance

    def _load_artifacts(self):
        self.is_heuristic_fallback = False
        try:
            self.model = joblib.load(ARTIFACTS_DIR / "nirvaah_xgboost.joblib")
            with open(ARTIFACTS_DIR / "ml_features.txt", "r") as f:
                self.expected_feature_names = [line.strip() for line in f if line.strip()]
            logger.info("WaterSafetyPredictor initialized with Nirvaah XGBoost model.")
        except Exception as e:
            logger.warning("Failed to load Nirvaah artifacts from %s: %s. Using heuristic fallback.", ARTIFACTS_DIR, e)
            self.is_heuristic_fallback = True
            self.expected_feature_names = []

    def calculate_composite_score(self, data: Dict[str, float]) -> int:
        """Calculates a deterministic 0-100 Water Quality Index baseline for heuristic fallback."""
        ph_penalty = abs(data.get("ph", 7.0) - 7.0) * 15.0
        turb_penalty = (data.get("turbidity_ntu", 5.0) / 100.0) * 35.0
        ec_penalty = (data.get("ec_us_cm", 400.0) / 2500.0) * 25.0
        particle_penalty = (data.get("particle_count", 50.0) / 600.0) * 25.0

        total_penalty = ph_penalty + turb_penalty + ec_penalty + particle_penalty
        score = max(0, min(100, int(100 - total_penalty)))
        return score

    def feature_engineering(self, raw_features: Dict[str, float]) -> pd.DataFrame:
        df = pd.DataFrame([raw_features])
        
        # 1. TIME FEATURES
        now = datetime.utcnow()
        df["month"] = raw_features.get("month", now.month)
        df["day_of_year"] = raw_features.get("day_of_year", now.timetuple().tm_yday)
        df["year"] = raw_features.get("year", now.year)
        
        # 2. SEASON
        def get_season(month):
            if month in [12, 1, 2]: return "winter"
            elif month in [3, 4, 5]: return "pre_monsoon"
            elif month in [6, 7, 8, 9]: return "monsoon"
            else: return "post_monsoon"
            
        df["season"] = df["month"].apply(get_season).astype("category")
        
        # Default Sensor Fallbacks for Satellite Parameters
        df["chl"] = df.get("chl", 1.85)
        df["kd490"] = df.get("kd490", 0.12)
        df["tsm"] = df.get("tsm", 4.50)
        df["wave_height"] = df.get("wave_height", 1.20)
        df["latitude"] = df.get("latitude", 16.27)
        df["longitude"] = df.get("longitude", 73.71)
        
        # 3. SATURATION FLAGS
        df["chl_saturated"] = (df["chl"] == 60.0).astype("int8")
        df["kd490_saturated"] = (df["kd490"] == 2.0).astype("int8")
        df["tsm_saturated"] = (df["tsm"] == 200.0).astype("int8")
        
        # 4. LOG TRANSFORMATIONS
        df["log_chl"] = np.log1p(df["chl"])
        df["log_kd490"] = np.log1p(df["kd490"])
        df["log_tsm"] = np.log1p(df["tsm"])
        
        # 5. CHLOROPHYLL / TSM RELATION
        df["chl_tsm_ratio"] = df["chl"] / (df["tsm"] + 1e-6)
        
        # 6. QUALITY FLAG
        df["has_saturation"] = (
            (df["chl_saturated"] == 1) |
            (df["kd490_saturated"] == 1) |
            (df["tsm_saturated"] == 1)
        ).astype("int8")
        
        # Provide mean, std and z-scores placeholders if not provided
        df["chl_mean"] = df.get("chl_mean", 1.5)
        df["chl_std"] = df.get("chl_std", 0.5)
        df["kd490_mean"] = df.get("kd490_mean", 0.1)
        df["kd490_std"] = df.get("kd490_std", 0.05)
        df["tsm_mean"] = df.get("tsm_mean", 4.0)
        df["tsm_std"] = df.get("tsm_std", 1.0)
        
        df["chl_z"] = (df["chl"] - df["chl_mean"]) / (df["chl_std"] + 1e-6)
        df["kd490_z"] = (df["kd490"] - df["kd490_mean"]) / (df["kd490_std"] + 1e-6)
        df["tsm_z"] = (df["tsm"] - df["tsm_mean"]) / (df["tsm_std"] + 1e-6)

        return df

    def predict(self, raw_features: Dict[str, float]) -> Dict[str, Any]:
        if getattr(self, "is_heuristic_fallback", False):
            safety_score = self.calculate_composite_score(raw_features)
            if safety_score < 45: pred_label = "VERY HIGH"
            elif safety_score < 75: pred_label = "MODERATE"
            else: pred_label = "LOW"
            return {
                "prediction": pred_label,
                "confidence_pct": 100.0,
                "safety_score": safety_score,
                "is_anomaly": pred_label in ["MODERATE", "HIGH", "VERY HIGH"],
                "alert_level": "CRITICAL" if pred_label == "VERY HIGH" else ("WARNING" if pred_label == "MODERATE" else "INFO"),
                "bloom_probability": 0.0,
                "reasons": ["Heuristic fallback used."],
                "recommendation": "Check model availability."
            }

        features_df = self.feature_engineering(raw_features)
        
        # Ensure strict 27-feature column ordering matching training contract
        features_df = features_df[self.expected_feature_names]
        
        # Predict bloom risk probability
        bloom_prob = float(self.model.predict_proba(features_df)[0][1])
        
        ph = raw_features.get("ph", 7.0)
        turbidity_ntu = raw_features.get("turbidity_ntu", 5.0)
        ec_us_cm = raw_features.get("ec_us_cm", 400.0)
        temperature_c = raw_features.get("temperature_c", 25.0)
        baseline_temp = 25.0 
        temp_anomaly = temperature_c - baseline_temp
        
        risk_result = calculate_nirvaah_risk(
            bloom_probability=bloom_prob,
            ph=ph,
            turbidity=turbidity_ntu,
            ec=ec_us_cm,
            temperature_anomaly=temp_anomaly
        )
        
        return {
            "prediction": risk_result["final_risk"],
            "confidence_pct": round(bloom_prob * 100, 2),
            "safety_score": risk_result["composite_score"],
            "is_anomaly": risk_result["final_risk"] in ["HIGH", "VERY HIGH"],
            "alert_level": "CRITICAL" if risk_result["final_risk"] == "VERY HIGH" else ("WARNING" if risk_result["final_risk"] in ["MODERATE", "HIGH"] else "INFO"),
            "bloom_probability": bloom_prob,
            "reasons": risk_result["reasons"],
            "recommendation": risk_result["recommendation"],
            "chl": features_df["chl"].iloc[0],
            "kd490": features_df["kd490"].iloc[0],
            "tsm": features_df["tsm"].iloc[0]
        }
