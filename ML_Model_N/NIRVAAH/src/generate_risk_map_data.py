import joblib
import pandas as pd
import numpy as np
from pathlib import Path


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

PROCESSED_DIR = BASE_DIR / "data" / "processed"

MODEL_PATH = PROCESSED_DIR / "nirvaah_xgboost.joblib"

TEST_PATH = PROCESSED_DIR / "nirvaah_test.parquet"

OUTPUT_PATH = (
    PROCESSED_DIR /
    "nirvaah_risk_predictions.parquet"
)


# ============================================================
# FEATURES
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
# RISK CATEGORY
# ============================================================

def risk_category(probability):

    if probability >= 0.90:
        return "VERY_HIGH"

    elif probability >= 0.80:
        return "HIGH"

    elif probability >= 0.50:
        return "MODERATE"

    else:
        return "LOW"


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 65)
    print("NIRVAAH - SPATIAL BLOOM RISK PREDICTION")
    print("=" * 65)

    # --------------------------------------------------------
    # Load model
    # --------------------------------------------------------

    print("\nLoading XGBoost model...")

    model = joblib.load(MODEL_PATH)

    print("Model loaded.")

    # --------------------------------------------------------
    # Load test dataset
    # --------------------------------------------------------

    print("\nLoading test dataset...")

    df = pd.read_parquet(TEST_PATH)

    print(f"Rows: {len(df):,}")

    # --------------------------------------------------------
    # Prepare features
    # --------------------------------------------------------

    print("\nPreparing features...")

    X = df[FEATURES].copy()

    X = X.replace(
        [np.inf, -np.inf],
        np.nan
    )

    valid_mask = X.notna().all(axis=1)

    X_valid = X.loc[valid_mask]

    df_valid = df.loc[valid_mask].copy()

    print(
        f"Valid observations: "
        f"{len(df_valid):,}"
    )

    # --------------------------------------------------------
    # Generate probabilities
    # --------------------------------------------------------

    print("\nGenerating XGBoost probabilities...")

    probabilities = model.predict_proba(
        X_valid
    )[:, 1]

    df_valid["bloom_probability"] = probabilities

    # --------------------------------------------------------
    # Risk category
    # --------------------------------------------------------

    print("\nAssigning risk categories...")

    df_valid["risk_category"] = [
        risk_category(p)
        for p in probabilities
    ]

    # --------------------------------------------------------
    # Select required columns
    # --------------------------------------------------------

    output_columns = [
        "time",
        "latitude",
        "longitude",
        "chl",
        "kd490",
        "tsm",
        "wave_height",
        "bloom_probability",
        "risk_category",
    ]

    output = df_valid[output_columns]

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    print("\nSaving risk prediction dataset...")

    output.to_parquet(
        OUTPUT_PATH,
        index=False
    )

    # --------------------------------------------------------
    # Summary
    # --------------------------------------------------------

    print("\n" + "=" * 65)
    print("RISK DISTRIBUTION")
    print("=" * 65)

    print(
        output["risk_category"]
        .value_counts()
    )

    print("\nProbability statistics:")

    print(
        output["bloom_probability"]
        .describe(
            percentiles=[
                0.50,
                0.90,
                0.95,
                0.99,
                0.999
            ]
        )
    )

    # --------------------------------------------------------
    # Highest-risk observations
    # --------------------------------------------------------

    print("\n" + "=" * 65)
    print("TOP 20 HIGHEST-RISK LOCATIONS")
    print("=" * 65)

    top = output.sort_values(
        "bloom_probability",
        ascending=False
    ).head(20)

    print(
        top[
            [
                "time",
                "latitude",
                "longitude",
                "bloom_probability",
                "risk_category"
            ]
        ].to_string(index=False)
    )

    print("\nSaved to:")

    print(OUTPUT_PATH)

    print("\n" + "=" * 65)
    print("STEP 15 COMPLETE")
    print("=" * 65)


if __name__ == "__main__":
    main()