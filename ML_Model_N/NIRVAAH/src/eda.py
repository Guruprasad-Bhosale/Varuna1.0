import pandas as pd

FILE = "../data/processed/nirvaah_ocm.parquet"

print("Loading NIRVAAH dataset...")

df = pd.read_parquet(FILE)

print("\n========== DATASET SHAPE ==========")
print("Rows:", len(df))
print("Columns:", len(df.columns))

print("\n========== COLUMNS ==========")
print(df.columns.tolist())

print("\n========== FIRST 5 ROWS ==========")
print(df.head())

print("\n========== DATA TYPES ==========")
print(df.dtypes)

print("\n========== MISSING VALUES ==========")
print(df.isnull().sum())

print("\n========== BASIC STATISTICS ==========")
print(df[["chl", "kd490", "tsm"]].describe())

print("\n========== DATE RANGE ==========")
print("Start:", df["time"].min())
print("End:", df["time"].max())

print("\n========== UNIQUE LOCATIONS ==========")
print("Latitudes:", df["latitude"].nunique())
print("Longitudes:", df["longitude"].nunique())

print("\n========== CHLOROPHYLL ==========")
print("Minimum:", df["chl"].min())
print("Maximum:", df["chl"].max())
print("Mean:", df["chl"].mean())
print("Median:", df["chl"].median())

print("\n========== KD490 ==========")
print("Minimum:", df["kd490"].min())
print("Maximum:", df["kd490"].max())
print("Mean:", df["kd490"].mean())
print("Median:", df["kd490"].median())

print("\n========== TSM ==========")
print("Minimum:", df["tsm"].min())
print("Maximum:", df["tsm"].max())
print("Mean:", df["tsm"].mean())
print("Median:", df["tsm"].median())