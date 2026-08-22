"""
============================================================
NIRVAAH - FINAL MASTER PIPELINE
============================================================

Purpose:
1. Load trained XGBoost model
2. Load test dataset
3. Generate bloom-risk probabilities
4. Apply optimized threshold = 0.90
5. Generate final risk categories
6. Generate spatial hotspot dataset
7. Generate hotspot map
8. Generate persistent hotspot map
9. Save final predictions and summary

IMPORTANT:
The EOS-06 OCM 2025 data is NOT mixed with the 2017-2020
training data. It remains an independent validation/demo layer.
"""

import os
import warnings
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

warnings.filterwarnings("ignore")


# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATA_DIR = os.path.join(BASE_DIR, "data", "processed")

TEST_FILE = os.path.join(
    DATA_DIR,
    "nirvaah_test.parquet"
)

MODEL_FILE = os.path.join(
    DATA_DIR,
    "nirvaah_xgboost.joblib"
)

FEATURE_FILE = os.path.join(
    DATA_DIR,
    "ml_features.txt"
)

OUTPUT_PREDICTIONS = os.path.join(
    DATA_DIR,
    "nirvaah_final_predictions.parquet"
)

OUTPUT_HOTSPOTS = os.path.join(
    DATA_DIR,
    "nirvaah_final_hotspots.parquet"
)

OUTPUT_SUMMARY = os.path.join(
    DATA_DIR,
    "nirvaah_final_summary.csv"
)

OUTPUT_METRICS = os.path.join(
    DATA_DIR,
    "nirvaah_final_metrics.csv"
)

OUTPUT_MAP = os.path.join(
    DATA_DIR,
    "nirvaah_final_hotspot_map.png"
)

OUTPUT_PERSISTENT_MAP = os.path.join(
    DATA_DIR,
    "nirvaah_final_persistent_hotspots.png"
)

OUTPUT_REPORT = os.path.join(
    DATA_DIR,
    "nirvaah_final_report.txt"
)

# Optimized threshold obtained from your threshold analysis
FINAL_THRESHOLD = 0.90


# ============================================================
# HELPER
# ============================================================

def section(title):

    print()
    print("=" * 65)
    print(title)
    print("=" * 65)


# ============================================================
# START
# ============================================================

section("NIRVAAH - FINAL MASTER PIPELINE")

print("\nProject directory:")
print(BASE_DIR)

print("\nData directory:")
print(DATA_DIR)


# ============================================================
# STEP 1 - LOAD MODEL
# ============================================================

section("STEP 1 - LOADING XGBOOST MODEL")

if not os.path.exists(MODEL_FILE):

    raise FileNotFoundError(
        f"\nXGBoost model not found:\n{MODEL_FILE}"
    )

print("Loading XGBoost model...")

model = joblib.load(MODEL_FILE)

print("Model loaded successfully.")
print("Model type:", type(model).__name__)


# ============================================================
# STEP 2 - LOAD TEST DATA
# ============================================================

section("STEP 2 - LOADING TEST DATA")

if not os.path.exists(TEST_FILE):

    raise FileNotFoundError(
        f"\nTest dataset not found:\n{TEST_FILE}"
    )

print("Loading test dataset...")

df = pd.read_parquet(TEST_FILE)

print("Rows:", len(df))
print("Columns:", len(df.columns))


# ============================================================
# STEP 3 - LOAD FEATURE LIST
# ============================================================

section("STEP 3 - LOADING ML FEATURES")

if not os.path.exists(FEATURE_FILE):

    raise FileNotFoundError(
        f"\nFeature file not found:\n{FEATURE_FILE}"
    )

with open(FEATURE_FILE, "r", encoding="utf-8") as f:

    features = [
        line.strip()
        for line in f
        if line.strip()
    ]

print("\nFeatures found:")

for i, feature in enumerate(features, start=1):

    print(f"{i:02d}. {feature}")


# ============================================================
# STEP 4 - CHECK FEATURES
# ============================================================

section("STEP 4 - FEATURE VALIDATION")

missing_features = [
    feature
    for feature in features
    if feature not in df.columns
]

if missing_features:

    print("\nMissing features:")

    for feature in missing_features:
        print("-", feature)

    raise ValueError(
        "\nRequired ML features are missing from test dataset."
    )

print("\nAll required features found.")

X = df[features].copy()

print("\nX shape:")
print(X.shape)



# ============================================================
# STEP 5 - FEATURE PREPARATION
# ============================================================

section("STEP 5 - FEATURE PREPARATION")

print("Checking data types...")

# IMPORTANT:
# Do NOT blindly encode season.
# The training dataset already contains the feature representation
# expected by the trained XGBoost model.

non_numeric = X.select_dtypes(
    exclude=[np.number]
).columns.tolist()

print("\nNon-numeric features:")

if non_numeric:

    for feature in non_numeric:
        print("-", feature)

else:

    print("None")


# ------------------------------------------------------------
# Handle object columns only when they actually exist
# ------------------------------------------------------------

for col in non_numeric:

    if col == "season":

        print("\nEncoding season...")

        season_mapping = {
            "winter": 0,
            "spring": 1,
            "summer": 2,
            "monsoon": 3,
            "autumn": 4,
            "fall": 4
        }

        X[col] = (
            X[col]
            .astype(str)
            .str.lower()
            .map(season_mapping)
        )

    else:

        X[col] = pd.to_numeric(
            X[col],
            errors="coerce"
        )


# ------------------------------------------------------------
# Replace infinite values
# ------------------------------------------------------------

X = X.replace(
    [np.inf, -np.inf],
    np.nan
)


# ------------------------------------------------------------
# Check missing values BEFORE filling
# ------------------------------------------------------------

missing_counts = X.isna().sum()

missing_total = missing_counts.sum()

if missing_total > 0:

    print(
        f"\nMissing feature values detected: "
        f"{missing_total:,}"
    )

    print("\nMissing values by feature:")

    print(
        missing_counts[
            missing_counts > 0
        ]
    )

    # Fill numeric missing values with training-compatible
    # median values from the current test data.

    for col in X.columns:

        if X[col].isna().any():

            X[col] = X[col].fillna(
                X[col].median()
            )

else:

    print("\nNo missing feature values.")


print("\nFinal X shape:")
print(X.shape)

print("\nFinal missing values:")
print(X.isna().sum().sum())


# ============================================================
# STEP 6 - GENERATE PROBABILITY
# ============================================================

section("STEP 6 - XGBOOST BLOOM PROBABILITY")

print("Generating predictions...")

probability = model.predict_proba(X)[:, 1]

df["bloom_probability"] = probability

print("\nProbability statistics:")

print(
    pd.Series(probability).describe(
        percentiles=[
            0.01,
            0.05,
            0.50,
            0.90,
            0.95,
            0.99
        ]
    )
)


# ============================================================
# STEP 7 - FINAL ML CLASSIFICATION
# ============================================================

section("STEP 7 - FINAL ML CLASSIFICATION")

print(
    f"\nFinal optimized threshold: "
    f"{FINAL_THRESHOLD}"
)

df["ml_bloom_risk"] = (
    df["bloom_probability"] >= FINAL_THRESHOLD
).astype(int)


df["ml_risk_category"] = np.where(
    df["bloom_probability"] >= 0.90,
    "HIGH",
    np.where(
        df["bloom_probability"] >= 0.50,
        "MODERATE",
        "LOW"
    )
)


# ============================================================
# STEP 8 - RISK SCORE
# ============================================================

section("STEP 8 - NIRVAAH RISK SCORE")

# Convert probability into a 0-100 score

df["ml_risk_score"] = (
    df["bloom_probability"] * 100
)


# Environmental score placeholder.
#
# Your current training dataset does not contain actual
# pH / EC / turbidity / temperature measurements.
#
# Therefore we DO NOT fabricate environmental observations.
#
# Current version uses ML risk as the primary operational score.

df["environmental_score"] = 0


df["nirvaah_risk_score"] = (
    df["ml_risk_score"]
)


# ============================================================
# STEP 9 - FINAL RISK CATEGORY
# ============================================================

section("STEP 9 - FINAL NIRVAAH RISK")

df["final_risk"] = pd.cut(
    df["nirvaah_risk_score"],
    bins=[
        -np.inf,
        50,
        75,
        90,
        np.inf
    ],
    labels=[
        "LOW",
        "MODERATE",
        "HIGH",
        "VERY_HIGH"
    ]
)


# ============================================================
# STEP 10 - SAVE FINAL PREDICTIONS
# ============================================================

section("STEP 10 - SAVING FINAL PREDICTIONS")

df.to_parquet(
    OUTPUT_PREDICTIONS,
    index=False
)

print(
    "\nSaved:"
)

print(
    OUTPUT_PREDICTIONS
)


# ============================================================
# STEP 11 - RISK DISTRIBUTION
# ============================================================

section("STEP 11 - FINAL RISK DISTRIBUTION")

risk_distribution = (
    df["final_risk"]
    .value_counts()
    .reindex(
        [
            "LOW",
            "MODERATE",
            "HIGH",
            "VERY_HIGH"
        ],
        fill_value=0
    )
)

print(risk_distribution)

risk_percentage = (
    risk_distribution /
    len(df) *
    100
).round(4)

print("\nRisk percentages:")

print(risk_percentage)


# ============================================================
# STEP 12 - SPATIAL HOTSPOTS
# ============================================================

section("STEP 12 - SPATIAL HOTSPOTS")

required_spatial = [
    "latitude",
    "longitude",
    "bloom_probability"
]

missing_spatial = [
    col
    for col in required_spatial
    if col not in df.columns
]

if missing_spatial:

    print("Cannot generate spatial hotspots.")
    print("Missing:", missing_spatial)

    spatial = pd.DataFrame()

else:

    print("Aggregating spatial risk...")

    # Observation-level high-risk flag
    df["high_risk_observation"] = (
        df["bloom_probability"] >= FINAL_THRESHOLD
    ).astype(int)

    spatial = (
        df.groupby(
            [
                "latitude",
                "longitude"
            ],
            as_index=False
        )
        .agg(
            mean_bloom_probability=(
                "bloom_probability",
                "mean"
            ),

            max_bloom_probability=(
                "bloom_probability",
                "max"
            ),

            high_risk_observations=(
                "high_risk_observation",
                "sum"
            ),

            observations=(
                "bloom_probability",
                "count"
            )
        )
    )

    # --------------------------------------------------------
    # Percentage of observations classified as high risk
    # --------------------------------------------------------

    spatial["high_risk_fraction"] = (
        spatial["high_risk_observations"]
        /
        spatial["observations"]
    )

    spatial["high_risk_percentage"] = (
        spatial["high_risk_fraction"] * 100
    )


    # --------------------------------------------------------
    # Spatial risk category
    # --------------------------------------------------------

    spatial["risk_category"] = np.select(
        [
            spatial["high_risk_fraction"] >= 0.50,

            spatial["high_risk_fraction"] >= 0.20,

            spatial["high_risk_fraction"] >= 0.05
        ],

        [
            "VERY_HIGH",

            "HIGH",

            "MODERATE"
        ],

        default="LOW"
    )


    # --------------------------------------------------------
    # Save spatial dataset
    # --------------------------------------------------------

    spatial.to_parquet(
        OUTPUT_HOTSPOTS,
        index=False
    )

    print("\nSpatial locations:")
    print(len(spatial))

    print("\nRisk category distribution:")

    print(
        spatial[
            "risk_category"
        ].value_counts()
    )

    print("\nSaved:")

    print(
        OUTPUT_HOTSPOTS
    )

# ============================================================
# STEP 13 - TOP HOTSPOTS
# ============================================================

section("STEP 13 - TOP 20 HOTSPOTS")

top_hotspots = (
    spatial
    .sort_values(
        [
            "high_risk_fraction",
            "mean_bloom_probability"
        ],
        ascending=False
    )
    .head(20)
)

print(
    top_hotspots[
        [
            "latitude",
            "longitude",
            "mean_bloom_probability",
            "max_bloom_probability",
            "high_risk_fraction",
            "high_risk_percentage",
            "observations",
            "risk_category"
        ]
    ].to_string(index=False)
)


# ============================================================
# STEP 14 - HOTSPOT MAP
# ============================================================

section("STEP 14 - GENERATING HOTSPOT MAP")

plt.figure(
    figsize=(12, 8)
)

scatter = plt.scatter(
    spatial["longitude"],
    spatial["latitude"],
    c=spatial["mean_bloom_probability"],
    cmap="RdYlGn_r",
    s=8,
    alpha=0.75,
    vmin=0,
    vmax=1
)

plt.colorbar(
    scatter,
    label="Mean Bloom Risk Probability"
)

plt.xlabel("Longitude")
plt.ylabel("Latitude")

plt.title(
    "NIRVAAH - Final AI Predicted Bloom Risk Hotspots"
)

plt.grid(
    alpha=0.25
)

plt.tight_layout()

plt.savefig(
    OUTPUT_MAP,
    dpi=300,
    bbox_inches="tight"
)

plt.close()

print(
    "\nSaved map:"
)

print(
    OUTPUT_MAP
)


# ============================================================
# STEP 15 - TOP 5% SPATIAL HOTSPOTS
# ============================================================

section("STEP 15 - TOP 5% SPATIAL HOTSPOTS")

top5_threshold = spatial[
    "high_risk_fraction"
].quantile(0.95)

top5 = spatial[
    spatial["high_risk_fraction"]
    >= top5_threshold
].copy()

print(
    "\nTop 5% high-risk-frequency threshold:",
    round(top5_threshold, 6)
)

print(
    "Top 5% hotspot locations:",
    len(top5)
)

print("\nTop hotspot locations:")

print(
    top5[
        [
            "latitude",
            "longitude",
            "high_risk_fraction",
            "high_risk_percentage",
            "mean_bloom_probability",
            "max_bloom_probability",
            "observations"
        ]
    ]
    .sort_values(
        "high_risk_fraction",
        ascending=False
    )
    .head(20)
    .to_string(index=False)
)


# ============================================================
# STEP 16 - PERSISTENT HOTSPOTS
# ============================================================

section("STEP 16 - PERSISTENT HOTSPOTS")

# A location is considered persistent when at least
# 10% of its observations cross the final ML threshold.

PERSISTENCE_THRESHOLD = 0.10

persistent = spatial[
    spatial["high_risk_fraction"]
    >= PERSISTENCE_THRESHOLD
].copy()

print("\nPersistence criterion:")

print(
    f"High-risk observation fraction >= "
    f"{PERSISTENCE_THRESHOLD:.0%}"
)

print(
    "\nPersistent hotspot locations:",
    len(persistent)
)

persistent_file = os.path.join(
    DATA_DIR,
    "nirvaah_persistent_hotspots.parquet"
)

persistent.to_parquet(
    persistent_file,
    index=False
)

print("\nSaved:")
print(persistent_file)

# ============================================================
# STEP 17 - PERSISTENT HOTSPOT MAP
# ============================================================

section("STEP 17 - PERSISTENT HOTSPOT MAP")

plt.figure(
    figsize=(12, 8)
)

# Background
plt.scatter(
    spatial["longitude"],
    spatial["latitude"],
    c=spatial["mean_bloom_probability"],
    cmap="RdYlGn_r",
    s=5,
    alpha=0.25,
    vmin=0,
    vmax=1
)

# Persistent hotspots
if len(persistent) > 0:

    plt.scatter(
        persistent["longitude"],
        persistent["latitude"],
        c=persistent["high_risk_fraction"],
        cmap="Reds",
        s=25,
        edgecolors="black",
        linewidths=0.3,
        vmin=0,
        vmax=1
    )

plt.xlabel("Longitude")

plt.ylabel("Latitude")

plt.title(
    "NIRVAAH - Persistent Bloom Risk Hotspots"
)

plt.grid(
    alpha=0.25
)

plt.tight_layout()

plt.savefig(
    OUTPUT_PERSISTENT_MAP,
    dpi=300,
    bbox_inches="tight"
)

plt.close()

print(
    "\nSaved:"
)

print(
    OUTPUT_PERSISTENT_MAP
)
# ============================================================
# STEP 18 - SUMMARY
# ============================================================

section("STEP 18 - FINAL SUMMARY")

summary = pd.DataFrame(
    {
        "metric": [
            "Total observations",
            "Total spatial locations",
            "Final ML threshold",
            "Top 5% probability threshold",
            "Persistent hotspot threshold",
            "LOW observations",
            "MODERATE observations",
            "HIGH observations",
            "VERY_HIGH observations"
        ],

        "value": [
            len(df),
            len(spatial),
            FINAL_THRESHOLD,
            top5_threshold,
            0.70,
            risk_distribution["LOW"],
            risk_distribution["MODERATE"],
            risk_distribution["HIGH"],
            risk_distribution["VERY_HIGH"]
        ]
    }
)

print(
    summary.to_string(index=False)
)

summary.to_csv(
    OUTPUT_SUMMARY,
    index=False
)


# ============================================================
# STEP 19 - FINAL REPORT
# ============================================================

section("STEP 19 - GENERATING FINAL REPORT")

with open(
    OUTPUT_REPORT,
    "w",
    encoding="utf-8"
) as report:

    report.write(
        "NIRVAAH FINAL PROJECT REPORT\n"
    )

    report.write(
        "=" * 60 + "\n\n"
    )

    report.write(
        "MODEL\n"
    )

    report.write(
        "XGBoost\n\n"
    )

    report.write(
        f"Final threshold: {FINAL_THRESHOLD}\n\n"
    )

    report.write(
        "DATASET\n"
    )

    report.write(
        f"Observations: {len(df):,}\n"
    )

    report.write(
        f"Spatial locations: {len(spatial):,}\n\n"
    )

    report.write(
        "RISK DISTRIBUTION\n"
    )

    for category, count in risk_distribution.items():

        percentage = (
            count / len(df) * 100
        )

        report.write(
            f"{category}: "
            f"{count:,} "
            f"({percentage:.4f}%)\n"
        )

    report.write(
        "\nTOP 5% HOTSPOT THRESHOLD\n"
    )

    report.write(
        f"{top5_threshold:.6f}\n"
    )

    report.write(
        "\nPERSISTENT HOTSPOT THRESHOLD\n"
    )

    report.write(
        "0.70\n"
    )

    report.write(
        "\nIMPORTANT SCIENTIFIC NOTE\n"
    )

    report.write(
        "The current bloom target is a bloom-risk proxy "
        "derived from ocean-colour/environmental observations. "
        "It should not be presented as direct ground-truth "
        "harmful algal bloom observations.\n"
    )

    report.write(
        "\nMICROPLASTIC MODULE\n"
    )

    report.write(
        "No validated microplastic training labels are "
        "currently used by the supervised ML model. "
        "Microplastic observations should be treated as "
        "a future external data-assimilation layer.\n"
    )

    report.write(
        "\nEOS-06 OCM\n"
    )

    report.write(
        "EOS-06 OCM 2025 data is maintained as an "
        "independent spectral validation/demo source "
        "and is not mixed with the 2017-2020 training data.\n"
    )


# ============================================================
# STEP 20 - FINAL OUTPUTS
# ============================================================

section("NIRVAAH FINAL PIPELINE COMPLETE")

print("\nFINAL OUTPUT FILES:")

outputs = [
    OUTPUT_PREDICTIONS,
    OUTPUT_HOTSPOTS,
    OUTPUT_SUMMARY,
    OUTPUT_MAP,
    OUTPUT_PERSISTENT_MAP,
    OUTPUT_REPORT
]

for path in outputs:

    if os.path.exists(path):

        size_mb = (
            os.path.getsize(path)
            / (1024 * 1024)
        )

        print(
            f"✓ {os.path.basename(path)} "
            f"({size_mb:.2f} MB)"
        )

    else:

        print(
            f"✗ {os.path.basename(path)}"
        )


print("\n")
print("=" * 65)
print("NIRVAAH PIPELINE FINISHED SUCCESSFULLY")
print("=" * 65)
print()