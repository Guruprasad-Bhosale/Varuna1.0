import pandas as pd

FILE = "../data/processed/nirvaah_ocm.parquet"

print("Loading dataset...")
df = pd.read_parquet(FILE)

print("\n========== EXACT EXTREME COUNTS ==========")

variables = {
    "chl": 60.0,
    "kd490": 2.0,
    "tsm": 200.0
}

for column, maximum in variables.items():

    count = (df[column] == maximum).sum()
    percentage = count / len(df) * 100

    print(f"\n{column.upper()}")
    print(f"Exact value {maximum}: {count:,} rows")
    print(f"Percentage: {percentage:.4f}%")

print("\n========== NEAR EXTREME VALUES ==========")

print("\nCHL >= 20:")
print((df["chl"] >= 20).sum())

print("\nKD490 >= 1:")
print((df["kd490"] >= 1).sum())

print("\nTSM >= 150:")
print((df["tsm"] >= 150).sum())


print("\n========== EXTREME VALUE COMBINATIONS ==========")

extreme = df[
    (df["chl"] >= 20) |
    (df["kd490"] >= 1) |
    (df["tsm"] >= 150)
]

print("Total extreme observations:", len(extreme))

print("\nCHL >= 20 AND KD490 >= 1:")
print(
    (
        (df["chl"] >= 20) &
        (df["kd490"] >= 1)
    ).sum()
)

print("\nTSM >= 150 AND CHL >= 20:")
print(
    (
        (df["tsm"] >= 150) &
        (df["chl"] >= 20)
    ).sum()
)

print("\n========== EXTREME SAMPLE ==========")

print(
    extreme[
        [
            "time",
            "latitude",
            "longitude",
            "chl",
            "kd490",
            "tsm"
        ]
    ].head(30)
)