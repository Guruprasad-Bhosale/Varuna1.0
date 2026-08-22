import pandas as pd
import xarray as xr
import numpy as np
from pathlib import Path


# =========================================================
# FILES
# =========================================================

INCOIS_FILE = "../data/processed/nirvaah_features.parquet"
WAVE_FILE = "../data/raw/wave_data.nc"
OUTPUT_FILE = "../data/processed/nirvaah_multisource.parquet"


print("========================================")
print(" NIRVAAH MULTI-SOURCE DATA INTEGRATION")
print("========================================")


# =========================================================
# 1. LOAD INCOIS FEATURES
# =========================================================

print("\nLoading INCOIS dataset...")

df = pd.read_parquet(INCOIS_FILE)

print(f"INCOIS rows: {len(df):,}")


# =========================================================
# 2. LOAD WAVE DATA
# =========================================================

print("\nLoading wave dataset...")

ds = xr.open_dataset(WAVE_FILE)

print("Wave variable: VAVH_INST")

wave = ds["VAVH_INST"]


# =========================================================
# 3. CONVERT WAVE DATA TO DATAFRAME
# =========================================================

print("\nConverting wave data...")

wave_df = wave.to_dataframe(
    name="wave_height"
).reset_index()


# Keep only required columns
wave_df = wave_df[
    [
        "time",
        "latitude",
        "longitude",
        "wave_height"
    ]
]


# =========================================================
# 4. CLEAN TIME
# =========================================================

df["time"] = pd.to_datetime(
    df["time"],
    utc=True
)

wave_df["time"] = pd.to_datetime(
    wave_df["time"],
    utc=True
)


# =========================================================
# 5. CREATE NEAREST WAVE GRID
# =========================================================

wave_latitudes = np.sort(
    wave_df["latitude"].unique()
)

wave_longitudes = np.sort(
    wave_df["longitude"].unique()
)


print("\nWave latitude grid:")
print(wave_latitudes)

print("\nWave longitude grid:")
print(wave_longitudes)


# Find nearest wave latitude
df["wave_latitude"] = np.abs(
    df["latitude"].values[:, None]
    - wave_latitudes[None, :]
).argmin(axis=1)

df["wave_latitude"] = wave_latitudes[
    df["wave_latitude"]
]


# Find nearest wave longitude
df["wave_longitude"] = np.abs(
    df["longitude"].values[:, None]
    - wave_longitudes[None, :]
).argmin(axis=1)

df["wave_longitude"] = wave_longitudes[
    df["wave_longitude"]
]


# =========================================================
# 6. RENAME WAVE COORDINATES
# =========================================================

wave_df = wave_df.rename(
    columns={
        "latitude": "wave_latitude",
        "longitude": "wave_longitude"
    }
)


# =========================================================
# 7. MERGE
# =========================================================

print("\nMerging INCOIS + wave data...")

df = df.merge(
    wave_df,
    on=[
        "time",
        "wave_latitude",
        "wave_longitude"
    ],
    how="left"
)


# =========================================================
# 8. CHECK WAVE COVERAGE
# =========================================================

missing_wave = df["wave_height"].isna().sum()

total_rows = len(df)

coverage = (
    (total_rows - missing_wave)
    / total_rows
    * 100
)


print("\n========== WAVE COVERAGE ==========")

print(
    f"Total rows: {total_rows:,}"
)

print(
    f"Missing wave values: {missing_wave:,}"
)

print(
    f"Wave coverage: {coverage:.2f}%"
)


# =========================================================
# 9. WAVE STATISTICS
# =========================================================

print("\n========== WAVE HEIGHT ==========")

print(
    df["wave_height"].describe()
)


# =========================================================
# 10. REMOVE TEMPORARY COLUMNS
# =========================================================

df = df.drop(
    columns=[
        "wave_latitude",
        "wave_longitude"
    ]
)


# =========================================================
# 11. SAVE
# =========================================================

print("\nSaving multisource dataset...")

Path(
    OUTPUT_FILE
).parent.mkdir(
    parents=True,
    exist_ok=True
)

df.to_parquet(
    OUTPUT_FILE,
    index=False
)


# =========================================================
# 12. FINAL SUMMARY
# =========================================================

print("\n========================================")
print(" NIRVAAH MULTI-SOURCE DATASET COMPLETE")
print("========================================")

print(
    f"Rows: {len(df):,}"
)

print(
    f"Columns: {len(df.columns)}"
)

print("\nColumns:")

for column in df.columns:
    print(
        " -",
        column
    )

print(
    f"\nSaved to: {OUTPUT_FILE}"
)

print("========================================")


ds.close()