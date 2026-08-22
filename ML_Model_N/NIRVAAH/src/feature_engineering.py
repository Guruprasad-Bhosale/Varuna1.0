import pandas as pd
import numpy as np

INPUT_FILE = "../data/processed/nirvaah_ocm.parquet"
OUTPUT_FILE = "../data/processed/nirvaah_features.parquet"

print("Loading NIRVAAH dataset...")

df = pd.read_parquet(INPUT_FILE)

print(f"Loaded {len(df):,} observations")


# =========================================================
# 1. TIME FEATURES
# =========================================================

df["month"] = df["time"].dt.month
df["day_of_year"] = df["time"].dt.dayofyear
df["year"] = df["time"].dt.year


# =========================================================
# 2. SEASON
# =========================================================

def get_season(month):

    if month in [12, 1, 2]:
        return "winter"

    elif month in [3, 4, 5]:
        return "pre_monsoon"

    elif month in [6, 7, 8, 9]:
        return "monsoon"

    else:
        return "post_monsoon"


df["season"] = df["month"].apply(get_season)


# =========================================================
# 3. SATURATION FLAGS
# =========================================================

df["chl_saturated"] = (
    df["chl"] == 60.0
).astype("int8")

df["kd490_saturated"] = (
    df["kd490"] == 2.0
).astype("int8")

df["tsm_saturated"] = (
    df["tsm"] == 200.0
).astype("int8")


# =========================================================
# 4. LOG TRANSFORMATIONS
# =========================================================

df["log_chl"] = np.log1p(df["chl"])

df["log_kd490"] = np.log1p(df["kd490"])

df["log_tsm"] = np.log1p(df["tsm"])


# =========================================================
# 5. CHLOROPHYLL / TSM RELATION
# =========================================================

df["chl_tsm_ratio"] = (
    df["chl"] / (df["tsm"] + 1e-6)
)


# =========================================================
# 6. QUALITY FLAG
# =========================================================

df["has_saturation"] = (
    (df["chl_saturated"] == 1) |
    (df["kd490_saturated"] == 1) |
    (df["tsm_saturated"] == 1)
).astype("int8")


# =========================================================
# 7. SAVE
# =========================================================

df.to_parquet(
    OUTPUT_FILE,
    index=False
)


# =========================================================
# SUMMARY
# =========================================================

print("\n========== FEATURE ENGINEERING COMPLETE ==========")

print("Rows:", f"{len(df):,}")

print("\nColumns:")
for column in df.columns:
    print(" -", column)

print("\nSaturation counts:")

print(
    "CHL saturated:",
    df["chl_saturated"].sum()
)

print(
    "KD490 saturated:",
    df["kd490_saturated"].sum()
)

print(
    "TSM saturated:",
    df["tsm_saturated"].sum()
)

print(
    "Any saturation:",
    df["has_saturation"].sum()
)

print(
    "\nSaved:",
    OUTPUT_FILE
)