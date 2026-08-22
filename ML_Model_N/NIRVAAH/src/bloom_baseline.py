import pandas as pd
import numpy as np

INPUT_FILE = "../data/processed/nirvaah_multisource.parquet"
OUTPUT_FILE = "../data/processed/nirvaah_anomalies.parquet"

print("=" * 60)
print(" NIRVAAH — BLOOM BASELINE & ANOMALY ENGINE")
print("=" * 60)

# =========================================================
# 1. LOAD DATA
# =========================================================

print("\nLoading multisource dataset...")

df = pd.read_parquet(INPUT_FILE)

print(f"Rows loaded: {len(df):,}")


# =========================================================
# 2. MAKE SURE TIME FEATURES EXIST
# =========================================================

df["time"] = pd.to_datetime(df["time"], utc=True)

df["month"] = df["time"].dt.month

df["year"] = df["time"].dt.year


# =========================================================
# 3. CREATE SEASON
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
# 4. REMOVE INVALID WAVE VALUES ONLY
# =========================================================

df.loc[
    df["wave_height"] < 0,
    "wave_height"
] = np.nan


# =========================================================
# 5. LOCATION + SEASON BASELINE
# =========================================================

print("\nCalculating location-season baselines...")

group_columns = [
    "latitude",
    "longitude",
    "season"
]


baseline = (
    df
    .groupby(group_columns)
    .agg(
        chl_mean=("chl", "mean"),
        chl_std=("chl", "std"),

        kd490_mean=("kd490", "mean"),
        kd490_std=("kd490", "std"),

        tsm_mean=("tsm", "mean"),
        tsm_std=("tsm", "std")
    )
    .reset_index()
)


# =========================================================
# 6. PROTECT AGAINST ZERO STANDARD DEVIATION
# =========================================================

baseline["chl_std"] = baseline["chl_std"].replace(
    0,
    np.nan
)

baseline["kd490_std"] = baseline["kd490_std"].replace(
    0,
    np.nan
)

baseline["tsm_std"] = baseline["tsm_std"].replace(
    0,
    np.nan
)


# =========================================================
# 7. MERGE BASELINE
# =========================================================

print("Joining baselines...")

df = df.merge(
    baseline,
    on=group_columns,
    how="left"
)


# =========================================================
# 8. CALCULATE Z-SCORE ANOMALIES
# =========================================================

print("Calculating anomalies...")


df["chl_z"] = (
    (df["chl"] - df["chl_mean"])
    / df["chl_std"]
)


df["kd490_z"] = (
    (df["kd490"] - df["kd490_mean"])
    / df["kd490_std"]
)


df["tsm_z"] = (
    (df["tsm"] - df["tsm_mean"])
    / df["tsm_std"]
)


# =========================================================
# 9. CAP EXTREME Z-SCORES FOR PROXY ENGINE
# =========================================================

# We keep the original values untouched.
# This is ONLY for the anomaly-based proxy.

df["chl_z_proxy"] = df["chl_z"].clip(-5, 5)

df["kd490_z_proxy"] = df["kd490_z"].clip(-5, 5)

df["tsm_z_proxy"] = df["tsm_z"].clip(-5, 5)


# =========================================================
# 10. SUMMARY
# =========================================================

print("\n" + "=" * 60)
print(" ANOMALY SUMMARY")
print("=" * 60)

print("\nCHL anomaly:")
print(
    df["chl_z"].describe(
        percentiles=[
            0.01,
            0.05,
            0.50,
            0.95,
            0.99
        ]
    )
)

print("\nKD490 anomaly:")
print(
    df["kd490_z"].describe(
        percentiles=[
            0.01,
            0.05,
            0.50,
            0.95,
            0.99
        ]
    )
)

print("\nTSM anomaly:")
print(
    df["tsm_z"].describe(
        percentiles=[
            0.01,
            0.05,
            0.50,
            0.95,
            0.99
        ]
    )
)


# =========================================================
# 11. HIGH-ANOMALY COUNTS
# =========================================================

print("\n" + "=" * 60)
print(" HIGH ANOMALY COUNTS")
print("=" * 60)

print(
    "CHL z >= 2:",
    (df["chl_z"] >= 2).sum()
)

print(
    "CHL z >= 3:",
    (df["chl_z"] >= 3).sum()
)

print(
    "KD490 z >= 2:",
    (df["kd490_z"] >= 2).sum()
)

print(
    "KD490 z >= 3:",
    (df["kd490_z"] >= 3).sum()
)

print(
    "TSM z >= 2:",
    (df["tsm_z"] >= 2).sum()
)

print(
    "TSM z >= 3:",
    (df["tsm_z"] >= 3).sum()
)


# =========================================================
# 12. SAVE
# =========================================================

print("\nSaving anomaly dataset...")

df.to_parquet(
    OUTPUT_FILE,
    index=False
)

print(
    f"\nSaved successfully:\n{OUTPUT_FILE}"
)

print("\nFinal rows:", f"{len(df):,}")

print("\nNew anomaly columns:")

for col in [
    "chl_z",
    "kd490_z",
    "tsm_z",
    "chl_z_proxy",
    "kd490_z_proxy",
    "tsm_z_proxy"
]:
    print(" -", col)

print("\n" + "=" * 60)
print(" STEP 6A COMPLETE")
print("=" * 60)