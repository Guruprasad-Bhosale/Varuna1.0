import pandas as pd
import numpy as np
from pathlib import Path


# ============================================================
# CONFIG
# ============================================================

INPUT_FILE = Path("../data/processed/nirvaah_bloom_proxy.parquet")
OUTPUT_FILE = Path("../data/processed/nirvaah_ml_dataset.parquet")

print("=" * 70)
print("NIRVAAH — ML DATASET BUILDER")
print("=" * 70)


# ============================================================
# 1. LOAD DATA
# ============================================================

print("\nLoading dataset...")

df = pd.read_parquet(INPUT_FILE)

print(f"Rows loaded: {len(df):,}")
print(f"Columns loaded: {len(df.columns)}")


# ============================================================
# 2. DEFINE FEATURES
# ============================================================

FEATURES = [
    # Ocean optical/environmental variables
    "chl",
    "kd490",
    "tsm",

    # Ocean dynamics
    "wave_height",

    # Spatial
    "latitude",
    "longitude",

    # Time
    "month",
    "day_of_year",
    "year",
    "season",

    # Saturation indicators
    "chl_saturated",
    "kd490_saturated",
    "tsm_saturated",

    # Transformations
    "log_chl",
    "log_kd490",
    "log_tsm",

    # Relationships
    "chl_tsm_ratio",
    "has_saturation",

    # Rolling/statistical features
    "chl_mean",
    "chl_std",
    "kd490_mean",
    "kd490_std",
    "tsm_mean",
    "tsm_std",

    # Anomaly features
    "chl_z",
    "kd490_z",
    "tsm_z",
]


TARGET = "bloom_proxy"


# ============================================================
# 3. CHECK FEATURES
# ============================================================

print("\nChecking required columns...")

missing_features = [
    col for col in FEATURES
    if col not in df.columns
]

if missing_features:
    print("\nERROR — Missing features:")

    for col in missing_features:
        print(" -", col)

    raise ValueError(
        "Some required features are missing."
    )


if TARGET not in df.columns:
    raise ValueError(
        f"Target column '{TARGET}' not found."
    )


print("All required columns found.")


# ============================================================
# 4. SELECT ONLY ML COLUMNS
# ============================================================

ml_columns = FEATURES + [TARGET]

ml_df = df[ml_columns].copy()


print("\nML dataset shape:")
print(ml_df.shape)


# ============================================================
# 5. CHECK DATA TYPES
# ============================================================

print("\nData types:")

print(
    ml_df.dtypes
)


# ============================================================
# 6. HANDLE SEASON
# ============================================================

# Convert categorical season to numeric codes.

if "season" in ml_df.columns:

    if not pd.api.types.is_numeric_dtype(
        ml_df["season"]
    ):

        ml_df["season"] = (
            ml_df["season"]
            .astype("category")
            .cat.codes
        )


# ============================================================
# 7. HANDLE MISSING / INFINITE VALUES
# ============================================================

print("\nChecking missing values...")

print(
    ml_df.isna().sum()
)


print("\nReplacing infinite values...")

ml_df = ml_df.replace(
    [np.inf, -np.inf],
    np.nan
)


before = len(ml_df)

ml_df = ml_df.dropna()

after = len(ml_df)

print(
    f"Removed rows: {before - after:,}"
)

print(
    f"Remaining rows: {after:,}"
)


# ============================================================
# 8. TARGET DISTRIBUTION
# ============================================================

print("\n" + "=" * 70)
print("TARGET DISTRIBUTION")
print("=" * 70)

print(
    ml_df[TARGET].value_counts()
)


print("\nTarget percentages:")

print(
    ml_df[TARGET]
    .value_counts(normalize=True)
    .mul(100)
)


# ============================================================
# 9. CHECK CLASS VALIDITY
# ============================================================

unique_targets = sorted(
    ml_df[TARGET].unique()
)

print(
    "\nUnique target values:",
    unique_targets
)


if not set(unique_targets).issubset({0, 1}):
    raise ValueError(
        "Target must contain only 0 and 1."
    )


# ============================================================
# 10. SORT BY TIME
# ============================================================

print("\nSorting dataset chronologically...")

# We need time for temporal train/test splitting.

# Load time separately from original dataset
time_values = df.loc[
    ml_df.index,
    "time"
]

ml_df["time"] = pd.to_datetime(
    time_values
)

ml_df = ml_df.sort_values(
    "time"
).reset_index(drop=True)


# ============================================================
# 11. TEMPORAL SPLIT
# ============================================================

print("\n" + "=" * 70)
print("TEMPORAL SPLIT")
print("=" * 70)

# Training:
# 2017-01-01 → 2019-12-31
#
# Testing:
# 2020-01-01 → 2020-05-01

train_mask = (
    ml_df["time"]
    < "2020-01-01"
)

test_mask = (
    ml_df["time"]
    >= "2020-01-01"
)


train_df = ml_df.loc[
    train_mask
].copy()

test_df = ml_df.loc[
    test_mask
].copy()


print(
    f"Training rows: {len(train_df):,}"
)

print(
    f"Testing rows:  {len(test_df):,}"
)


print(
    "\nTraining period:"
)

print(
    train_df["time"].min(),
    "→",
    train_df["time"].max()
)


print(
    "\nTesting period:"
)

print(
    test_df["time"].min(),
    "→",
    test_df["time"].max()
)


# ============================================================
# 12. CHECK TARGET DISTRIBUTION IN EACH SPLIT
# ============================================================

print("\n" + "=" * 70)
print("TRAIN / TEST TARGET DISTRIBUTION")
print("=" * 70)


print("\nTRAIN:")

print(
    train_df[TARGET]
    .value_counts()
)

print(
    train_df[TARGET]
    .value_counts(normalize=True)
    .mul(100)
)


print("\nTEST:")

print(
    test_df[TARGET]
    .value_counts()
)

print(
    test_df[TARGET]
    .value_counts(normalize=True)
    .mul(100)
)


# ============================================================
# 13. SAVE TRAINING DATA
# ============================================================

train_output = Path(
    "../data/processed/nirvaah_train.parquet"
)

test_output = Path(
    "../data/processed/nirvaah_test.parquet"
)


print("\nSaving training dataset...")

train_df.to_parquet(
    train_output,
    index=False
)


print(
    f"Saved: {train_output}"
)


print("\nSaving testing dataset...")

test_df.to_parquet(
    test_output,
    index=False
)


print(
    f"Saved: {test_output}"
)


# ============================================================
# 14. SAVE FEATURE LIST
# ============================================================

feature_file = Path(
    "../data/processed/ml_features.txt"
)

with open(
    feature_file,
    "w"
) as f:

    for feature in FEATURES:
        f.write(feature + "\n")


print(
    f"\nFeature list saved: {feature_file}"
)


# ============================================================
# 15. FINAL SUMMARY
# ============================================================

print("\n" + "=" * 70)
print("NIRVAAH ML DATASET READY")
print("=" * 70)

print(
    f"\nFeatures: {len(FEATURES)}"
)

print(
    f"Training rows: {len(train_df):,}"
)

print(
    f"Testing rows: {len(test_df):,}"
)

print(
    "\nTarget:",
    TARGET
)

print(
    "\nTraining file:",
    train_output
)

print(
    "Testing file:",
    test_output
)

print("\n" + "=" * 70)
print("STEP 7 COMPLETE")
print("=" * 70)