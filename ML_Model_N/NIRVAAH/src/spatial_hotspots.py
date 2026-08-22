import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

INPUT_FILE = "../data/processed/nirvaah_risk_predictions.parquet"
OUTPUT_FILE = "../data/processed/nirvaah_spatial_hotspots.parquet"

print("=" * 60)
print("NIRVAAH - PERSISTENT SPATIAL HOTSPOT ANALYSIS")
print("=" * 60)

print("\nLoading risk predictions...")

df = pd.read_parquet(INPUT_FILE)

print(f"Rows loaded: {len(df):,}")
print(f"Columns: {list(df.columns)}")


# ============================================================
# 1. CHECK REQUIRED COLUMNS
# ============================================================

required = [
    "latitude",
    "longitude",
    "bloom_probability"
]

missing = [c for c in required if c not in df.columns]

if missing:
    raise ValueError(f"Missing columns: {missing}")

print("\nRequired columns found.")


# ============================================================
# 2. CLEAN DATA
# ============================================================

df = df[
    [
        "time",
        "latitude",
        "longitude",
        "bloom_probability",
        "risk_category"
    ]
].copy()

df = df.replace([np.inf, -np.inf], np.nan)

df = df.dropna(
    subset=[
        "latitude",
        "longitude",
        "bloom_probability"
    ]
)

print(f"Valid observations: {len(df):,}")


# ============================================================
# 3. DEFINE HIGH-RISK OBSERVATION
# ============================================================

# 0.80 = high-recall operational threshold
df["high_risk"] = (
    df["bloom_probability"] >= 0.80
).astype(int)


# ============================================================
# 4. SPATIAL AGGREGATION
# ============================================================

print("\nAggregating observations by location...")

hotspots = (
    df.groupby(
        ["latitude", "longitude"],
        observed=True
    )
    .agg(
        observations=("bloom_probability", "count"),
        mean_probability=("bloom_probability", "mean"),
        max_probability=("bloom_probability", "max"),
        high_risk_observations=("high_risk", "sum")
    )
    .reset_index()
)


# ============================================================
# 5. HIGH-RISK PERCENTAGE
# ============================================================

hotspots["high_risk_percentage"] = (
    hotspots["high_risk_observations"]
    / hotspots["observations"]
    * 100
)


# ============================================================
# 6. PERSISTENT HOTSPOT DEFINITION
# ============================================================

# A location is considered a persistent hotspot when:
#
# Mean bloom probability >= 0.70
# AND
# At least 50% of observations are high-risk

# ============================================================
# DATA-DRIVEN PERSISTENT HOTSPOT DEFINITION
# ============================================================

# Instead of using an arbitrary probability threshold,
# identify the highest-risk 5% of spatial locations.

risk_cutoff = hotspots["mean_probability"].quantile(0.95)

print("\n" + "=" * 60)
print("DATA-DRIVEN HOTSPOT THRESHOLD")
print("=" * 60)

print(
    f"\n95th percentile of spatial mean probability: "
    f"{risk_cutoff:.6f}"
)

hotspots["persistent_hotspot"] = (
    hotspots["mean_probability"] >= risk_cutoff
).astype(int)

# ============================================================
# 7. SORT HOTSPOTS
# ============================================================

hotspots = hotspots.sort_values(
    [
        "persistent_hotspot",
        "mean_probability",
        "high_risk_percentage"
    ],
    ascending=False
)


# ============================================================
# 8. SUMMARY
# ============================================================

print("\n" + "=" * 60)
print("SPATIAL HOTSPOT SUMMARY")
print("=" * 60)

print(
    f"\nTotal spatial locations: "
    f"{len(hotspots):,}"
)

print(
    f"Persistent hotspots: "
    f"{hotspots['persistent_hotspot'].sum():,}"
)

print(
    f"Persistent hotspot percentage: "
    f"{hotspots['persistent_hotspot'].mean() * 100:.2f}%"
)


# ============================================================
# 9. TOP 20 HOTSPOTS
# ============================================================

print("\n" + "=" * 60)
print("TOP 20 PERSISTENT BLOOM HOTSPOTS")
print("=" * 60)

top20 = hotspots[
    hotspots["persistent_hotspot"] == 1
].head(20)

print(
    top20[
        [
            "latitude",
            "longitude",
            "observations",
            "mean_probability",
            "high_risk_percentage"
        ]
    ].to_string(index=False)
)


# ============================================================
# 10. SAVE DATASET
# ============================================================

print("\nSaving spatial hotspot dataset...")

hotspots.to_parquet(
    OUTPUT_FILE,
    index=False
)

print(f"Saved: {OUTPUT_FILE}")


# ============================================================
# 11. PLOT PERSISTENT HOTSPOTS
# ============================================================

print("\nGenerating hotspot map...")

plt.figure(figsize=(12, 8))

normal = hotspots[
    hotspots["persistent_hotspot"] == 0
]

persistent = hotspots[
    hotspots["persistent_hotspot"] == 1
]

plt.figure(figsize=(12, 8))

plt.scatter(
    normal["longitude"],
    normal["latitude"],
    c=normal["mean_probability"],
    cmap="viridis",
    s=10,
    alpha=0.25
)

plt.scatter(
    persistent["longitude"],
    persistent["latitude"],
    c=persistent["mean_probability"],
    cmap="Reds",
    s=40,
    edgecolors="black",
    linewidths=0.4
)

plt.colorbar(
    label="Mean Bloom Risk Probability"
)

plt.xlabel("Longitude")
plt.ylabel("Latitude")

plt.title(
    "NIRVAAH - Top 5% Predicted Bloom Risk Hotspots"
)

plt.grid(alpha=0.2)

plt.tight_layout()

plt.savefig(
    "../data/processed/nirvaah_persistent_hotspots.png",
    dpi=300
)

plt.show()

print("\n" + "=" * 60)
print("STEP 17 COMPLETE")
print("=" * 60)