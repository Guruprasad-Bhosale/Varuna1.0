import pandas as pd
import numpy as np

INPUT_FILE = "../data/processed/nirvaah_anomalies.parquet"
OUTPUT_FILE = "../data/processed/nirvaah_bloom_proxy.parquet"

print("=" * 60)
print(" NIRVAAH — BLOOM RISK PROXY ENGINE")
print("=" * 60)


# =========================================================
# 1. LOAD DATA
# =========================================================

print("\nLoading anomaly dataset...")

df = pd.read_parquet(INPUT_FILE)

print(f"Rows: {len(df):,}")


# =========================================================
# 2. GROUP BY LOCATION + SEASON
# =========================================================

group_columns = [
    "latitude",
    "longitude",
    "season"
]


print("\nCalculating location-season percentile ranks...")


# Percentile rank within each location + season
df["chl_percentile"] = (
    df.groupby(group_columns)["chl"]
      .rank(pct=True)
)


df["kd490_percentile"] = (
    df.groupby(group_columns)["kd490"]
      .rank(pct=True)
)


df["tsm_percentile"] = (
    df.groupby(group_columns)["tsm"]
      .rank(pct=True)
)


# =========================================================
# 3. BLOOM RISK SCORE
# =========================================================

print("\nCalculating Bloom Risk Score...")


df["bloom_risk_score"] = (
    0.60 * df["chl_percentile"]
    +
    0.25 * df["kd490_percentile"]
    +
    0.15 * df["tsm_percentile"]
)


# =========================================================
# 4. TURBIDITY FLAG
# =========================================================

# Extremely high TSM can indicate sediment/turbidity
# rather than biological bloom conditions.

tsm_threshold = df["tsm"].quantile(0.99)

df["turbidity_flag"] = (
    df["tsm"] >= tsm_threshold
)


print(
    f"\nTSM 99th percentile: {tsm_threshold:.4f}"
)

print(
    "Extreme TSM observations:",
    df["turbidity_flag"].sum()
)


# =========================================================
# 5. BLOOM CANDIDATE
# =========================================================

# Primary requirement:
# CHL must be unusually high.

chl_threshold = df["chl_percentile"].quantile(0.95)


# Risk threshold will initially be 90th percentile.
risk_threshold = df["bloom_risk_score"].quantile(0.90)


print(
    f"\nCHL percentile threshold: {chl_threshold:.4f}"
)

print(
    f"Bloom risk threshold: {risk_threshold:.4f}"
)


# =========================================================
# 6. CREATE PROXY TARGET
# =========================================================

df["bloom_proxy"] = (
    (df["chl_percentile"] >= chl_threshold)
    &
    (df["bloom_risk_score"] >= risk_threshold)
    &
    (~df["turbidity_flag"])
).astype("int8")


# =========================================================
# 7. RISK CATEGORY
# =========================================================

df["bloom_risk_category"] = pd.cut(
    df["bloom_risk_score"],
    bins=[
        -np.inf,
        0.30,
        0.60,
        0.80,
        np.inf
    ],
    labels=[
        "LOW",
        "MODERATE",
        "HIGH",
        "VERY_HIGH"
    ]
)


# =========================================================
# 8. SUMMARY
# =========================================================

print("\n" + "=" * 60)
print(" BLOOM PROXY SUMMARY")
print("=" * 60)


print("\nBloom proxy counts:")

print(
    df["bloom_proxy"].value_counts()
)


print("\nBloom proxy percentages:")

print(
    df["bloom_proxy"]
      .value_counts(normalize=True)
      .mul(100)
)


print("\nRisk categories:")

print(
    df["bloom_risk_category"]
      .value_counts()
      .sort_index()
)


# =========================================================
# 9. BLOOM SAMPLE
# =========================================================

print("\n" + "=" * 60)
print(" SAMPLE BLOOM OBSERVATIONS")
print("=" * 60)


sample_columns = [
    "time",
    "latitude",
    "longitude",
    "chl",
    "kd490",
    "tsm",
    "wave_height",
    "chl_percentile",
    "kd490_percentile",
    "tsm_percentile",
    "bloom_risk_score",
    "bloom_proxy"
]


print(
    df.loc[
        df["bloom_proxy"] == 1,
        sample_columns
    ].head(20).to_string(index=False)
)


# =========================================================
# 10. SAVE
# =========================================================

print("\nSaving Bloom Proxy dataset...")

df.to_parquet(
    OUTPUT_FILE,
    index=False
)


print(
    f"\nSaved to:\n{OUTPUT_FILE}"
)


print("\nFinal columns:")

for column in df.columns:
    print(" -", column)


print("\n" + "=" * 60)
print(" STEP 6B COMPLETE")
print("=" * 60)