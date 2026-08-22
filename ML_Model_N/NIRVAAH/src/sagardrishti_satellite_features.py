import pandas as pd
import numpy as np
import os


# =========================================================
# SAGARDRISHTI - SATELLITE FEATURE ENGINEERING
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
# LOAD BAND DATA
# =========================================================

band_file = os.path.join(
    DATA_DIR,
    "sagardrishti_band_clean.csv"
)

band = pd.read_csv(band_file)

print("BAND data:", band.shape)


# =========================================================
# LOAD RRS DATA
# =========================================================

rrs_file = os.path.join(
    DATA_DIR,
    "sagardrishti_rrs_clean.csv"
)

rrs = pd.read_csv(rrs_file)

print("RRS data:", rrs.shape)


# =========================================================
# RENAME COMMON COLUMNS
# =========================================================

band = band.rename(
    columns={
        "latitude": "latitude_band",
        "longitude": "longitude_band"
    }
)

rrs = rrs.rename(
    columns={
        "latitude": "latitude_rrs",
        "longitude": "longitude_rrs"
    }
)


# =========================================================
# CREATE SPECTRAL INDICES
# =========================================================

print("\nCreating spectral features...")


# ---------------------------------------------------------
# BAND NORMALIZED DIFFERENCE
# ---------------------------------------------------------

if "BAND08" in band.columns and "BAND04" in band.columns:

    denominator = (
        band["BAND08"] +
        band["BAND04"]
    )

    band["NDVI_like"] = np.where(
        denominator != 0,
        (
            band["BAND08"] -
            band["BAND04"]
        ) / denominator,
        np.nan
    )


# ---------------------------------------------------------
# BLUE-GREEN RATIO
# ---------------------------------------------------------

if "BAND03" in band.columns and "BAND02" in band.columns:

    band["blue_green_ratio"] = np.where(
        band["BAND02"] != 0,
        band["BAND03"] /
        band["BAND02"],
        np.nan
    )


# ---------------------------------------------------------
# RED-NIR RATIO
# ---------------------------------------------------------

if "BAND08" in band.columns and "BAND05" in band.columns:

    band["red_nir_ratio"] = np.where(
        band["BAND05"] != 0,
        band["BAND08"] /
        band["BAND05"],
        np.nan
    )


# =========================================================
# RRS SPECTRAL FEATURES
# =========================================================

if "RRS05" in rrs.columns and "RRS04" in rrs.columns:

    denominator = (
        rrs["RRS05"] +
        rrs["RRS04"]
    )

    rrs["RRS_normalized_difference"] = np.where(
        denominator != 0,
        (
            rrs["RRS05"] -
            rrs["RRS04"]
        ) / denominator,
        np.nan
    )


# =========================================================
# SAVE
# =========================================================

band_output = os.path.join(
    DATA_DIR,
    "sagardrishti_band_features.csv"
)

rrs_output = os.path.join(
    DATA_DIR,
    "sagardrishti_rrs_features.csv"
)


band.to_csv(
    band_output,
    index=False
)

rrs.to_csv(
    rrs_output,
    index=False
)


# =========================================================
# SUMMARY
# =========================================================

print("\n==========================================")
print("SAGARDRISHTI SATELLITE FEATURES READY")
print("==========================================")

print("\nBAND features:")
print(
    band.columns.tolist()
)

print("\nRRS features:")
print(
    rrs.columns.tolist()
)

print("\nSaved:")
print(band_output)
print(rrs_output)

print("\nDONE!")