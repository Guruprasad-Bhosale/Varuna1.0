import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_PATH = (
    BASE_DIR /
    "data" /
    "processed" /
    "nirvaah_risk_predictions.parquet"
)

OUTPUT_PATH = (
    BASE_DIR /
    "data" /
    "processed" /
    "nirvaah_hotspot_map.png"
)


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 65)
print("NIRVAAH - BLOOM RISK HOTSPOT MAP")
print("=" * 65)

print("\nLoading prediction dataset...")

df = pd.read_parquet(DATA_PATH)

print(f"Rows loaded: {len(df):,}")


# ============================================================
# SAMPLE DATA
# ============================================================

# Plotting every 615k points is unnecessary.
# We keep all high-risk observations and sample low-risk ones.

high_risk = df[
    df["bloom_probability"] >= 0.80
]

low_risk = df[
    df["bloom_probability"] < 0.80
].sample(
    min(30000, len(df[df["bloom_probability"] < 0.80])),
    random_state=42
)

plot_df = pd.concat(
    [low_risk, high_risk]
)


print(
    f"High-risk observations: "
    f"{len(high_risk):,}"
)

print(
    f"Plotting observations: "
    f"{len(plot_df):,}"
)


# ============================================================
# CREATE MAP
# ============================================================

plt.figure(
    figsize=(12, 8)
)

scatter = plt.scatter(
    plot_df["longitude"],
    plot_df["latitude"],
    c=plot_df["bloom_probability"],
    cmap="RdYlGn_r",
    vmin=0,
    vmax=1,
    s=5,
    alpha=0.6
)


# ============================================================
# MAP DETAILS
# ============================================================

plt.xlabel("Longitude")

plt.ylabel("Latitude")

plt.title(
    "NIRVAAH - AI Predicted Bloom Risk Hotspots"
)

plt.colorbar(
    scatter,
    label="Bloom Risk Probability"
)

plt.grid(
    alpha=0.2
)


# ============================================================
# SAVE
# ============================================================

plt.tight_layout()

plt.savefig(
    OUTPUT_PATH,
    dpi=300
)

plt.show()


print("\nMap saved to:")

print(OUTPUT_PATH)

print("\n" + "=" * 65)
print("STEP 16 COMPLETE")
print("=" * 65)