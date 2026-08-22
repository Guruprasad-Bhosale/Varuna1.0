import pandas as pd
import numpy as np
import os

# =========================================================
# SAGARDRISHTI - EOS-06 SATELLITE DATA PREPARATION
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

RAW_DIR = os.path.join(
    BASE_DIR,
    "data",
    "raw"
)

PROCESSED_DIR = os.path.join(
    BASE_DIR,
    "data",
    "processed"
)

os.makedirs(
    PROCESSED_DIR,
    exist_ok=True
)


# =========================================================
# RRS DATA
# =========================================================

print("\nLoading RRS data...")

rrs = pd.read_csv(
    os.path.join(
        RAW_DIR,
        "RRS_Features.csv"
    )
)

print("Original RRS shape:", rrs.shape)

RRS_FEATURES = [
    "RRS01",
    "RRS02",
    "RRS03",
    "RRS04",
    "RRS05",
    "RRS06",
    "RRS07",
    "RRS08",
    "RRS09",
    "RRS10"
]

# Convert invalid satellite value
rrs[RRS_FEATURES] = rrs[
    RRS_FEATURES
].replace(
    -999,
    np.nan
)

# Remove rows with no usable spectral data
rrs = rrs.dropna(
    subset=RRS_FEATURES,
    how="all"
)

print("Clean RRS shape:", rrs.shape)


# =========================================================
# BAND DATA
# =========================================================

print("\nLoading BAND data...")

band = pd.read_csv(
    os.path.join(
        RAW_DIR,
        "BAND_Features.csv"
    )
)

print("Original BAND shape:", band.shape)

BAND_FEATURES = [
    "BAND01",
    "BAND02",
    "BAND03",
    "BAND04",
    "BAND05",
    "BAND06",
    "BAND07",
    "BAND08",
    "BAND09",
    "BAND10",
    "BAND11",
    "BAND12",
    "BAND13"
]

# Convert invalid zero values
band[BAND_FEATURES] = band[
    BAND_FEATURES
].replace(
    0,
    np.nan
)

# Remove rows with no spectral information
band = band.dropna(
    subset=BAND_FEATURES,
    how="all"
)

print("Clean BAND shape:", band.shape)


# =========================================================
# SAVE CLEAN DATA
# =========================================================

rrs_output = os.path.join(
    PROCESSED_DIR,
    "sagardrishti_rrs_clean.csv"
)

band_output = os.path.join(
    PROCESSED_DIR,
    "sagardrishti_band_clean.csv"
)

rrs.to_csv(
    rrs_output,
    index=False
)

band.to_csv(
    band_output,
    index=False
)


# =========================================================
# INFORMATION
# =========================================================

print("\n==========================================")
print("SAGARDRISHTI SATELLITE DATA READY")
print("==========================================")

print("\nRRS:")
print(rrs.shape)

print("\nBAND:")
print(band.shape)

print("\nRRS columns:")
print(rrs.columns.tolist())

print("\nBAND columns:")
print(band.columns.tolist())

print("\nSaved:")
print(rrs_output)
print(band_output)

print("\nSatellite preprocessing complete!")