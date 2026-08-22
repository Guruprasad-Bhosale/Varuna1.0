import pandas as pd
import os

# =========================================================
# SAGARDRISHTI - MICROPLASTIC DATA PREPARATION
# =========================================================

# Project root is one level above src/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

INPUT_FILE = os.path.join(
    BASE_DIR,
    "data",
    "raw",
    "Microplastic_DN_HA_201910_W.xlsx"
)

OUTPUT_DIR = os.path.join(
    BASE_DIR,
    "data",
    "processed"
)

OUTPUT_FILE = os.path.join(
    OUTPUT_DIR,
    "sagardrishti_microplastic.csv"
)

os.makedirs(OUTPUT_DIR, exist_ok=True)


# =========================================================
# LOAD EXCEL
# =========================================================

print("\nLoading microplastic research dataset...")

raw = pd.read_excel(
    INPUT_FILE,
    header=None
)

print("Original shape:", raw.shape)


# =========================================================
# REPLICATE 1
# =========================================================

replicate_1 = {
    "sampling_date": "2019-10-30",

    "water_volume_m3": raw.iloc[2, 1],

    "microplastic_count": raw.iloc[3, 1],

    "microplastic_concentration_m3": raw.iloc[4, 1],

    "fragment_count": raw.iloc[3, 4],

    "fragment_concentration_m3": raw.iloc[4, 4],

    "fiber_count": raw.iloc[3, 8],

    "fiber_concentration_m3": raw.iloc[4, 8]
}


# =========================================================
# REPLICATE 2
# =========================================================

replicate_2 = {
    "sampling_date": "2019-10-30",

    "water_volume_m3": raw.iloc[2, 13],

    "microplastic_count": raw.iloc[3, 13],

    "microplastic_concentration_m3": raw.iloc[4, 13],

    "fragment_count": raw.iloc[3, 16],

    "fragment_concentration_m3": raw.iloc[4, 16],

    "fiber_count": raw.iloc[3, 20],

    "fiber_concentration_m3": raw.iloc[4, 20]
}


# =========================================================
# CREATE DATAFRAME
# =========================================================

microplastic = pd.DataFrame([
    replicate_1,
    replicate_2
])


# =========================================================
# CONVERT NUMERIC VALUES
# =========================================================

numeric_columns = [
    "water_volume_m3",
    "microplastic_count",
    "microplastic_concentration_m3",
    "fragment_count",
    "fragment_concentration_m3",
    "fiber_count",
    "fiber_concentration_m3"
]

for column in numeric_columns:

    microplastic[column] = pd.to_numeric(
        microplastic[column],
        errors="coerce"
    )


# =========================================================
# ADD AVERAGE CONCENTRATION
# =========================================================

average_microplastic = (
    microplastic[
        "microplastic_concentration_m3"
    ].mean()
)

microplastic["average_reference_concentration_m3"] = (
    average_microplastic
)


# =========================================================
# SAVE CLEAN DATA
# =========================================================

microplastic.to_csv(
    OUTPUT_FILE,
    index=False
)


# =========================================================
# DISPLAY RESULTS
# =========================================================

print("\n==========================================")
print("SAGARDRISHTI MICROPLASTIC DATA READY")
print("==========================================")

print("\nClean dataset:")
print(
    microplastic.to_string(index=False)
)

print(
    "\nAverage measured concentration:",
    round(average_microplastic, 2),
    "items/m³"
)

print("\nSaved to:")
print(OUTPUT_FILE)

print("\nIMPORTANT:")
print(
    "Microplastic data has NOT been artificially "
    "merged with satellite rows."
)