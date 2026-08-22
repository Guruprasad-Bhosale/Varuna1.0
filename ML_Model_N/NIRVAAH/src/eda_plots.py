import pandas as pd
import matplotlib.pyplot as plt

FILE = "../data/processed/nirvaah_ocm.parquet"

print("Loading dataset...")

df = pd.read_parquet(FILE)

print("Loaded:", len(df), "rows")


# =========================================================
# 1. CHLOROPHYLL DISTRIBUTION
# =========================================================

plt.figure(figsize=(10, 6))

plt.hist(
    df["chl"],
    bins=100
)

plt.xlabel("Chlorophyll-a (mg/m³)")
plt.ylabel("Frequency")
plt.title("NIRVAAH - Chlorophyll-a Distribution")

plt.tight_layout()
plt.show()


# =========================================================
# 2. KD490 DISTRIBUTION
# =========================================================

plt.figure(figsize=(10, 6))

plt.hist(
    df["kd490"],
    bins=100
)

plt.xlabel("KD490 (m⁻¹)")
plt.ylabel("Frequency")
plt.title("NIRVAAH - KD490 Distribution")

plt.tight_layout()
plt.show()


# =========================================================
# 3. TSM DISTRIBUTION
# =========================================================

plt.figure(figsize=(10, 6))

plt.hist(
    df["tsm"],
    bins=100
)

plt.xlabel("TSM (mg/L)")
plt.ylabel("Frequency")
plt.title("NIRVAAH - TSM Distribution")

plt.tight_layout()
plt.show()


# =========================================================
# 4. CHL vs TSM
# =========================================================

sample = df.sample(
    n=min(100000, len(df)),
    random_state=42
)

plt.figure(figsize=(10, 6))

plt.scatter(
    sample["tsm"],
    sample["chl"],
    s=2,
    alpha=0.3
)

plt.xlabel("TSM (mg/L)")
plt.ylabel("Chlorophyll-a (mg/m³)")
plt.title("NIRVAAH - Chlorophyll vs TSM")

plt.tight_layout()
plt.show()


# =========================================================
# 5. EXTREME VALUE ANALYSIS
# =========================================================

print("\n========== HIGH PERCENTILES ==========")

print("\nCHL:")
print(
    df["chl"].quantile(
        [0.90, 0.95, 0.99, 0.995, 0.999]
    )
)

print("\nKD490:")
print(
    df["kd490"].quantile(
        [0.90, 0.95, 0.99, 0.995, 0.999]
    )
)

print("\nTSM:")
print(
    df["tsm"].quantile(
        [0.90, 0.95, 0.99, 0.995, 0.999]
    )
)


# =========================================================
# 6. EXTREME OBSERVATIONS
# =========================================================

print("\n========== EXTREME CHL ==========")

print(
    df.nlargest(20, "chl")[
        [
            "time",
            "latitude",
            "longitude",
            "chl",
            "kd490",
            "tsm"
        ]
    ]
)

print("\n========== EXTREME TSM ==========")

print(
    df.nlargest(20, "tsm")[
        [
            "time",
            "latitude",
            "longitude",
            "chl",
            "kd490",
            "tsm"
        ]
    ]
)