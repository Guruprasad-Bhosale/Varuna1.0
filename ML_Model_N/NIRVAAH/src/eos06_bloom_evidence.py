import pandas as pd
import numpy as np


# =========================================================
# SAGARDRISHTI
# EOS-06 BLOOM SPECTRAL EVIDENCE
# =========================================================

INPUT_FILE = (
    "../data/processed/"
    "sagardrishti_spectral_features.csv"
)

OUTPUT_FILE = (
    "../data/processed/"
    "sagardrishti_eos06_bloom_evidence.csv"
)


# =========================================================
# LOAD
# =========================================================

df = pd.read_csv(INPUT_FILE)

print("EOS-06 input shape:", df.shape)


# =========================================================
# REQUIRED FEATURES
# =========================================================
required = [
    "NDCI",
    "red_edge_ratio",
    "chl_absorption_difference",
    "phycocyanin_band"
]

missing = [
    x for x in required
    if x not in df.columns
]

if missing:
    raise ValueError(
        f"Missing features: {missing}"
    )


# =========================================================
# CLEAN
# =========================================================

for column in required:

    df[column] = pd.to_numeric(
        df[column],
        errors="coerce"
    )


df = df.replace(
    [np.inf, -np.inf],
    np.nan
)


# =========================================================
# NORMALIZED RANKS
# =========================================================
#
# We use within-scene percentile ranks rather than
# arbitrary absolute thresholds.
#
# This is an evidence score, NOT a bloom label.
# =========================================================

df["NDCI_rank"] = (
    df["NDCI"]
    .rank(pct=True)
)

df["MCI_rank"] = (
    df["MCI"]
    .rank(pct=True)
)

df["red_edge_rank"] = (
    df["red_edge_ratio"]
    .rank(pct=True)
)

df["phycocyanin_rank"] = (
    df["phycocyanin_band"]
    .rank(pct=True)
)


# =========================================================
# SPECTRAL BLOOM EVIDENCE
# =========================================================
#
# Red-edge/chlorophyll indicators receive more weight.
#
# IMPORTANT:
# These are evidence weights, NOT learned ML
# feature importance percentages.
# =========================================================
df["spectral_bloom_evidence"] = (

    0.40 * df["NDCI_rank"]

    +

    0.35 * df["red_edge_rank"]

    +

    0.25 * df["phycocyanin_rank"]

)


# =========================================================
# EVIDENCE CATEGORY
# =========================================================

df["spectral_evidence_category"] = pd.cut(

    df["spectral_bloom_evidence"],

    bins=[
        -np.inf,
        0.25,
        0.50,
        0.75,
        0.90,
        np.inf
    ],

    labels=[
        "LOW",
        "MODERATE",
        "ELEVATED",
        "HIGH",
        "VERY_HIGH"
    ]
)


# =========================================================
# SUMMARY
# =========================================================

print("\n==============================================")
print("EOS-06 SPECTRAL BLOOM EVIDENCE")
print("==============================================")

print("\nEvidence statistics:")

print(
    df["spectral_bloom_evidence"]
    .describe()
)


print("\nEvidence categories:")

print(
    df["spectral_evidence_category"]
    .value_counts()
    .sort_index()
)


# =========================================================
# TOP SPECTRAL BLOOM LOCATIONS
# =========================================================

print("\nTop 10 spectral evidence locations:")

print(
    df[
        [
            "latitude",
            "longitude",
            "NDCI",
            "MCI",
            "red_edge_ratio",
            "phycocyanin_band",
            "spectral_bloom_evidence",
            "spectral_evidence_category"
        ]
    ]
    .sort_values(
        "spectral_bloom_evidence",
        ascending=False
    )
    .head(10)
    .to_string(index=False)
)


# =========================================================
# SAVE
# =========================================================

df.to_csv(
    OUTPUT_FILE,
    index=False
)


print("\nSaved:")
print(OUTPUT_FILE)

print("\nDONE!")