import pandas as pd
from pathlib import Path

INPUT_FILE = Path("../data/raw/incois_oceansat2.csv")
OUTPUT_FILE = Path("../data/processed/nirvaah_ocm.parquet")

OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

chunks = []

print("Reading INCOIS dataset...")

for chunk in pd.read_csv(
    INPUT_FILE,
    skiprows=[1],
    chunksize=100_000
):
    # Rename columns
    chunk = chunk.rename(columns={
        "latitude": "latitude",
        "longitude": "longitude",
        "CHL": "chl",
        "KD490": "kd490",
        "TSM": "tsm"
    })

    # Convert numeric columns
    numeric_columns = [
        "latitude",
        "longitude",
        "chl",
        "kd490",
        "tsm"
    ]

    for col in numeric_columns:
        chunk[col] = pd.to_numeric(
            chunk[col],
            errors="coerce"
        )

    # Convert time
    chunk["time"] = pd.to_datetime(
        chunk["time"],
        errors="coerce"
    )

    # Remove invalid observations
    chunk = chunk.dropna(
        subset=[
            "time",
            "latitude",
            "longitude",
            "chl",
            "kd490",
            "tsm"
        ]
    )

    # Keep only our study region
    chunk = chunk[
        (chunk["latitude"] >= 15.5) &
        (chunk["latitude"] <= 21.0) &
        (chunk["longitude"] >= 71.5) &
        (chunk["longitude"] <= 73.5)
    ]

    # Remove physically invalid negative values
    chunk = chunk[
        (chunk["chl"] >= 0) &
        (chunk["kd490"] >= 0) &
        (chunk["tsm"] >= 0)
    ]

    chunks.append(chunk)

    print(
        f"Processed {len(chunk):,} valid rows..."
    )

# Combine processed chunks
df = pd.concat(chunks, ignore_index=True)

# Remove duplicate observations
df = df.drop_duplicates(
    subset=[
        "time",
        "latitude",
        "longitude"
    ]
)

# Sort
df = df.sort_values(
    ["time", "latitude", "longitude"]
)

# Save efficient format
df.to_parquet(
    OUTPUT_FILE,
    index=False
)

print("\n========== NIRVAAH DATASET ==========")
print(f"Rows: {len(df):,}")
print(f"Columns: {list(df.columns)}")
print(f"Date range: {df['time'].min()} → {df['time'].max()}")
print(f"File saved: {OUTPUT_FILE}")
print("======================================")