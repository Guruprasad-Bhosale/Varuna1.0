"""
NIRVAAH - End-to-End ML Prediction

Loads the trained XGBoost model,
generates bloom-risk probability,
and sends the prediction to the
NIRVAAH Risk Engine.
"""

import joblib
import pandas as pd
import numpy as np
from pathlib import Path

from nirvaah_risk_engine import calculate_nirvaah_risk


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

PROCESSED_DIR = BASE_DIR / "data" / "processed"


# ============================================================
# REQUIRED FEATURES
# ============================================================

FEATURES = [
    "chl",
    "kd490",
    "tsm",
    "wave_height",
    "latitude",
    "longitude",
    "month",
    "day_of_year",
    "year",
    "season",
    "chl_saturated",
    "kd490_saturated",
    "tsm_saturated",
    "log_chl",
    "log_kd490",
    "log_tsm",
    "chl_tsm_ratio",
    "has_saturation",
    "chl_mean",
    "chl_std",
    "kd490_mean",
    "kd490_std",
    "tsm_mean",
    "tsm_std",
    "chl_z",
    "kd490_z",
    "tsm_z",
]


# ============================================================
# FIND MODEL
# ============================================================

def find_xgboost_model():

    possible_models = [
        PROCESSED_DIR / "nirvaah_xgboost_model.joblib",
        PROCESSED_DIR / "nirvaah_xgb_model.joblib",
        PROCESSED_DIR / "nirvaah_xgboost.joblib",
        PROCESSED_DIR / "xgboost_model.joblib",
    ]

    for model_path in possible_models:

        if model_path.exists():
            return model_path

    # Automatic fallback
    xgb_models = list(PROCESSED_DIR.glob("*xgb*.joblib"))
    xgb_models += list(PROCESSED_DIR.glob("*xgboost*.joblib"))

    if xgb_models:
        return xgb_models[0]

    raise FileNotFoundError(
        "XGBoost model not found in data/processed/"
    )


# ============================================================
# FIND TEST DATA
# ============================================================

def find_test_dataset():

    possible_files = [
        PROCESSED_DIR / "nirvaah_test.parquet",
        PROCESSED_DIR / "nirvaah_test_predictions.parquet",
    ]

    for file in possible_files:

        if file.exists():
            return file

    raise FileNotFoundError(
        "NIRVAAH test dataset not found."
    )


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 60)
    print("NIRVAAH - REAL XGBOOST PREDICTION")
    print("=" * 60)

    # --------------------------------------------------------
    # Load model
    # --------------------------------------------------------

    model_path = find_xgboost_model()

    print("\nLoading XGBoost model...")
    print(f"Model: {model_path}")

    model = joblib.load(model_path)

    print("Model loaded successfully.")

    # --------------------------------------------------------
    # Load dataset
    # --------------------------------------------------------

    data_path = find_test_dataset()

    print("\nLoading test dataset...")
    print(f"Dataset: {data_path}")

    df = pd.read_parquet(data_path)

    print(f"Rows loaded: {len(df):,}")

    # --------------------------------------------------------
    # Check features
    # --------------------------------------------------------

    print("\nChecking ML features...")

    missing_features = [
        feature
        for feature in FEATURES
        if feature not in df.columns
    ]

    if missing_features:

        print("\nERROR: Missing features:")

        for feature in missing_features:
            print(f" - {feature}")

        raise ValueError(
            "Required ML features are missing."
        )

    print("All 27 features found.")

    # --------------------------------------------------------
    # Remove invalid rows
    # --------------------------------------------------------

    X = df[FEATURES].copy()

    X = X.replace(
        [np.inf, -np.inf],
        np.nan
    )

    valid_mask = X.notna().all(axis=1)

    X_valid = X.loc[valid_mask]

    df_valid = df.loc[valid_mask].copy()

    print(
        f"Valid rows available: "
        f"{len(X_valid):,}"
    )

    # --------------------------------------------------------
    # Select one real observation
    # --------------------------------------------------------

    sample = X_valid.iloc[[0]]

    sample_metadata = df_valid.iloc[0]

    print("\n" + "=" * 60)
    print("SAMPLE OBSERVATION")
    print("=" * 60)

    print(
        f"Time      : {sample_metadata['time']}"
    )

    print(
        f"Latitude  : {sample_metadata['latitude']}"
    )

    print(
        f"Longitude : {sample_metadata['longitude']}"
    )

    print(
        f"CHL       : {sample_metadata['chl']}"
    )

    print(
        f"KD490     : {sample_metadata['kd490']}"
    )

    print(
        f"TSM       : {sample_metadata['tsm']}"
    )

    print(
        f"Wave      : {sample_metadata['wave_height']}"
    )

    # --------------------------------------------------------
    # XGBoost prediction
    # --------------------------------------------------------

    print("\nGenerating XGBoost prediction...")

    bloom_probability = model.predict_proba(
        sample
    )[0, 1]

    print(
        f"\nBloom-risk probability: "
        f"{bloom_probability:.6f}"
    )

    # --------------------------------------------------------
    # Get ML risk category
    # --------------------------------------------------------

    if bloom_probability >= 0.90:

        ml_risk = "VERY HIGH"

    elif bloom_probability >= 0.80:

        ml_risk = "HIGH"

    elif bloom_probability >= 0.50:

        ml_risk = "MODERATE"

    else:

        ml_risk = "LOW"

    print(
        f"ML Risk: {ml_risk}"
    )

    # --------------------------------------------------------
    # Environmental sensor values
    #
    # Currently these are placeholders.
    # Later they will come from actual sensors/API.
    # --------------------------------------------------------

    ph = 7.4
    turbidity = 5.0
    ec = 520.0
    temperature_anomaly = 0.4

    # --------------------------------------------------------
    # NIRVAAH Risk Engine
    # --------------------------------------------------------

    result = calculate_nirvaah_risk(

        bloom_probability=bloom_probability,

        ph=ph,

        turbidity=turbidity,

        ec=ec,

        temperature_anomaly=temperature_anomaly
    )

    # --------------------------------------------------------
    # Final output
    # --------------------------------------------------------

    print("\n" + "=" * 60)
    print("NIRVAAH FINAL DECISION")
    print("=" * 60)

    print(
        f"\nLocation:"
        f" {sample_metadata['latitude']:.4f}, "
        f"{sample_metadata['longitude']:.4f}"
    )

    print(
        f"\nBloom Probability : "
        f"{bloom_probability:.2%}"
    )

    print(
        f"ML Risk           : "
        f"{result['ml_risk']}"
    )

    print(
        f"Final NIRVAAH Risk : "
        f"{result['final_risk']}"
    )

    print(
        f"\nEnvironmental Score : "
        f"{result['environmental_score']}"
    )

    print("\nReasons:")

    for reason in result["reasons"]:
        print(f" - {reason}")

    print("\nRecommendation:")
    print(result["recommendation"])

    print("\n" + "=" * 60)
    print("REAL ML → NIRVAAH PIPELINE COMPLETE")
    print("=" * 60)


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    main()