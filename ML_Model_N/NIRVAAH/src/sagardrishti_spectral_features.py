import pandas as pd
import numpy as np
import os


# =========================================================
# SAGARDRISHTI
# EOS-06 OCM SPECTRAL FEATURE ENGINEERING
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

DATA_DIR = os.path.join(
    BASE_DIR,
    "data",
    "processed"
)


# =========================================================
# LOAD RRS
# =========================================================

INPUT_FILE = os.path.join(
    DATA_DIR,
    "sagardrishti_rrs_clean.csv"
)

df = pd.read_csv(INPUT_FILE)

print("Input RRS shape:", df.shape)


# =========================================================
# EOS-06 OCM WAVELENGTH MAPPING
# =========================================================

# From BAND_META.txt

wavelengths = {
    "RRS01": 413.6,
    "RRS02": 442.6,
    "RRS03": 489.2,
    "RRS04": 509.1,
    "RRS05": 554.3,
    "RRS06": 565.3,
    "RRS07": 618.9,
    "RRS08": 669.1,
    "RRS09": 680.7,
    "RRS10": 710.6
}


# =========================================================
# 1. NDCI
# =========================================================

# NDCI = (R710 - R669) / (R710 + R669)

denominator = (
    df["RRS10"] +
    df["RRS08"]
)

df["NDCI"] = np.where(
    denominator != 0,
    (
        df["RRS10"] -
        df["RRS08"]
    ) / denominator,
    np.nan
)


# =========================================================
# 2. RED-EDGE RATIO
# =========================================================

df["red_edge_ratio"] = np.where(
    df["RRS08"] != 0,
    df["RRS10"] / df["RRS08"],
    np.nan
)


# =========================================================
# 3. CHLOROPHYLL ABSORPTION DIFFERENCE
# =========================================================

df["chl_absorption_difference"] = (
    df["RRS08"] -
    df["RRS09"]
)


# =========================================================
# 4. MCI - MAXIMUM CHLOROPHYLL INDEX
# =========================================================

# Wavelengths:
#
# R669.1
# R680.7
# R710.6
#
# Linear baseline between 669.1 and 710.6 nm

lambda1 = 669.1
lambda2 = 680.7
lambda3 = 710.6

baseline = (
    df["RRS08"]
    +
    (
        (lambda2 - lambda1)
        /
        (lambda3 - lambda1)
    )
    *
    (
        df["RRS10"] -
        df["RRS08"]
    )
)

df["MCI"] = (
    df["RRS09"] -
    baseline
)


# =========================================================
# 5. PHYCOCYANIN-SENSITIVE BAND
# =========================================================

# 618.9 nm is retained as a dedicated feature.

df["phycocyanin_band"] = df["RRS07"]


# =========================================================
# 6. BLUE-GREEN RATIO
# =========================================================

df["blue_green_ratio"] = np.where(
    df["RRS05"] != 0,
    df["RRS02"] / df["RRS05"],
    np.nan
)





# =========================================================
# CLEAN INFINITE VALUES
# =========================================================

df = df.replace(
    [np.inf, -np.inf],
    np.nan
)


# =========================================================
# SAVE
# =========================================================

OUTPUT_FILE = os.path.join(
    DATA_DIR,
    "sagardrishti_spectral_features.csv"
)

df.to_csv(
    OUTPUT_FILE,
    index=False
)


# =========================================================
# RESULTS
# =========================================================

print("\n==============================================")
print("SAGARDRISHTI SPECTRAL FEATURES CREATED")
print("==============================================")

print("\nNew features:")

print("NDCI")
print("MCI")
print("red_edge_ratio")
print("chl_absorption_difference")
print("phycocyanin_band")
print("blue_green_ratio")

print("\nOutput shape:", df.shape)

print("\nOutput file:")
print(OUTPUT_FILE)

print("\nSample:")
print(
    df[
        [
            "latitude",
            "longitude",
            "NDCI",
            "MCI",
            "red_edge_ratio",
            "chl_absorption_difference",
            "phycocyanin_band"
        ]
    ].head()
)

print("\nDONE!")