import pandas as pd
import numpy as np


# =========================================================
# SAGARDRISHTI
# RESEARCH-BASED BLOOM TARGET
# =========================================================

INPUT_FILE = (
    "../data/processed/"
    "nirvaah_bloom_proxy.parquet"
)

OUTPUT_FILE = (
    "../data/processed/"
    "sagardrishti_research_bloom.parquet"
)


# =========================================================
# LOAD
# =========================================================

print("\nLoading bloom dataset...")

df = pd.read_parquet(INPUT_FILE)

print("Original shape:", df.shape)


# =========================================================
# CHECK REQUIRED COLUMNS
# =========================================================

required = [
    "chl",
    "chl_percentile",
    "chl_z",
    "latitude",
    "longitude",
    "season"
]

missing = [
    c for c in required
    if c not in df.columns
]

if missing:
    raise ValueError(
        f"Missing columns: {missing}"
    )


# =========================================================
# RESEARCH-BASED CHLOROPHYLL CATEGORIES
# =========================================================
#
# Based on the 2025 Indian coastal study:
#
# >= 25th percentile  -> Likely to Bloom
# >= 50th percentile  -> Bloom
# >= 75th percentile  -> Intense Bloom
# >= 90th percentile  -> Extreme Bloom
#
# IMPORTANT:
# We are using the EXISTING CHL percentile
# only as an experimental proxy.
#
# We are NOT claiming that this is already the
# exact hotspot-specific threshold methodology
# from the paper.
# =========================================================


def classify_bloom(percentile):

    if pd.isna(percentile):
        return "UNKNOWN"

    if percentile < 0.25:
        return "BACKGROUND"

    elif percentile < 0.50:
        return "LIKELY_TO_BLOOM"

    elif percentile < 0.75:
        return "BLOOM"

    elif percentile < 0.90:
        return "INTENSE_BLOOM"

    else:
        return "EXTREME_BLOOM"


df["research_bloom_category"] = (
    df["chl_percentile"]
    .apply(classify_bloom)
)


# =========================================================
# BINARY RESEARCH BLOOM FLAG
# =========================================================
#
# For comparison with your existing binary model:
#
# 0 = below 50th percentile
# 1 = Bloom or higher
#
# This is an EXPERIMENTAL comparison target.
# =========================================================

df["research_bloom_binary"] = (
    df["chl_percentile"] >= 0.50
).astype(int)


# =========================================================
# EXTREME BLOOM FLAG
# =========================================================

df["research_extreme_bloom"] = (
    df["chl_percentile"] >= 0.90
).astype(int)


# =========================================================
# SUMMARY
# =========================================================

print("\n==============================================")
print("RESEARCH BLOOM CLASSIFICATION")
print("==============================================")

print("\nCategory distribution:")

print(
    df["research_bloom_category"]
    .value_counts()
    .sort_index()
)


print("\nBinary distribution:")

print(
    df["research_bloom_binary"]
    .value_counts()
)


print("\nExtreme bloom distribution:")

print(
    df["research_extreme_bloom"]
    .value_counts()
)


# =========================================================
# COMPARE WITH EXISTING PROXY
# =========================================================

if "bloom_proxy" in df.columns:

    print("\n==============================================")
    print("OLD PROXY vs RESEARCH TARGET")
    print("==============================================")

    comparison = pd.crosstab(
        df["bloom_proxy"],
        df["research_extreme_bloom"],
        rownames=["Existing bloom_proxy"],
        colnames=["Research extreme bloom"]
    )

    print(comparison)


# =========================================================
# SAVE
# =========================================================

df.to_parquet(
    OUTPUT_FILE,
    index=False
)


print("\nSaved:")
print(OUTPUT_FILE)

print("\nDONE!")