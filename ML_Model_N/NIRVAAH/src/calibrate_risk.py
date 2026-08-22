import pandas as pd
import numpy as np
from pathlib import Path

from xgboost import XGBClassifier

from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score
)


# ============================================================
# CONFIG
# ============================================================

TRAIN_FILE = Path(
    "../data/processed/nirvaah_train.parquet"
)

TEST_FILE = Path(
    "../data/processed/nirvaah_test.parquet"
)

RANDOM_STATE = 42

NON_BLOOM_SAMPLE = 300_000


print("=" * 75)
print("NIRVAAH — BLOOM RISK CALIBRATION")
print("=" * 75)


# ============================================================
# FEATURES
# ============================================================

FEATURES = [
    "chl",
    "kd490",
    "tsm",
    "wave_height",

    "latitude",
    "longitude",

    "month",
    "day_of_year",
    "year",
    "season",

    "chl_saturated",
    "kd490_saturated",
    "tsm_saturated",

    "log_chl",
    "log_kd490",
    "log_tsm",

    "chl_tsm_ratio",
    "has_saturation",

    "chl_mean",
    "chl_std",

    "kd490_mean",
    "kd490_std",

    "tsm_mean",
    "tsm_std",

    "chl_z",
    "kd490_z",
    "tsm_z"
]

TARGET = "bloom_proxy"


# ============================================================
# LOAD DATA
# ============================================================

print("\nLoading training dataset...")

train_df = pd.read_parquet(
    TRAIN_FILE
)

print(
    f"Training rows: {len(train_df):,}"
)


print("\nLoading testing dataset...")

test_df = pd.read_parquet(
    TEST_FILE
)

print(
    f"Testing rows: {len(test_df):,}"
)


# ============================================================
# CREATE SAME TRAINING SAMPLE
# ============================================================

print("\nPreparing training sample...")


bloom_df = train_df[
    train_df[TARGET] == 1
].copy()


non_bloom_df = train_df[
    train_df[TARGET] == 0
].copy()


non_bloom_sample = non_bloom_df.sample(
    n=min(
        NON_BLOOM_SAMPLE,
        len(non_bloom_df)
    ),
    random_state=RANDOM_STATE
)


sample_df = pd.concat(
    [
        bloom_df,
        non_bloom_sample
    ],
    ignore_index=True
)


sample_df = sample_df.sample(
    frac=1,
    random_state=RANDOM_STATE
).reset_index(drop=True)


print(
    f"Training sample: {len(sample_df):,}"
)


# ============================================================
# X / Y
# ============================================================

X_train = sample_df[
    FEATURES
].copy()

y_train = sample_df[
    TARGET
].astype(int)


X_test = test_df[
    FEATURES
].copy()

y_test = test_df[
    TARGET
].astype(int)


# ============================================================
# CLEAN DATA
# ============================================================

print("\nCleaning data...")


X_train = X_train.replace(
    [np.inf, -np.inf],
    np.nan
)

X_test = X_test.replace(
    [np.inf, -np.inf],
    np.nan
)


medians = X_train.median()


X_train = X_train.fillna(
    medians
)

X_test = X_test.fillna(
    medians
)


# ============================================================
# TRAIN XGBOOST
# ============================================================

print("\nTraining XGBoost...")


model = XGBClassifier(

    n_estimators=400,

    max_depth=8,

    learning_rate=0.08,

    subsample=0.8,

    colsample_bytree=0.8,

    min_child_weight=5,

    objective="binary:logistic",

    eval_metric="logloss",

    tree_method="hist",

    n_jobs=-1,

    random_state=RANDOM_STATE
)


model.fit(
    X_train,
    y_train
)


print("Training complete.")


# ============================================================
# PROBABILITIES
# ============================================================

print("\nGenerating bloom probabilities...")


probabilities = model.predict_proba(
    X_test
)[:, 1]


# ============================================================
# THRESHOLD ANALYSIS
# ============================================================

print("\n")
print("=" * 75)
print("THRESHOLD ANALYSIS")
print("=" * 75)


thresholds = np.arange(
    0.10,
    1.00,
    0.05
)


results = []


for threshold in thresholds:

    predictions = (
        probabilities >= threshold
    ).astype(int)


    precision = precision_score(
        y_test,
        predictions,
        zero_division=0
    )


    recall = recall_score(
        y_test,
        predictions,
        zero_division=0
    )


    f1 = f1_score(
        y_test,
        predictions,
        zero_division=0
    )


    results.append({

        "threshold": threshold,

        "precision": precision,

        "recall": recall,

        "f1": f1
    })


results_df = pd.DataFrame(
    results
)


print(
    results_df.to_string(
        index=False
    )
)


# ============================================================
# BEST F1 THRESHOLD
# ============================================================

best_f1_row = results_df.loc[
    results_df["f1"].idxmax()
]


print("\n")
print("=" * 75)
print("BEST F1 THRESHOLD")
print("=" * 75)


print(
    f"\nThreshold : "
    f"{best_f1_row['threshold']:.2f}"
)

print(
    f"Precision : "
    f"{best_f1_row['precision']:.4f}"
)

print(
    f"Recall    : "
    f"{best_f1_row['recall']:.4f}"
)

print(
    f"F1        : "
    f"{best_f1_row['f1']:.4f}"
)


# ============================================================
# HIGH RECALL THRESHOLD
# ============================================================

high_recall = results_df[
    results_df["recall"] >= 0.95
]


if len(high_recall) > 0:

    best_high_recall = high_recall.loc[
        high_recall["precision"].idxmax()
    ]


    print("\n")
    print("=" * 75)
    print("BEST HIGH-RECALL THRESHOLD")
    print("=" * 75)


    print(
        f"\nThreshold : "
        f"{best_high_recall['threshold']:.2f}"
    )

    print(
        f"Precision : "
        f"{best_high_recall['precision']:.4f}"
    )

    print(
        f"Recall    : "
        f"{best_high_recall['recall']:.4f}"
    )

    print(
        f"F1        : "
        f"{best_high_recall['f1']:.4f}"
    )


# ============================================================
# PROBABILITY DISTRIBUTION
# ============================================================

print("\n")
print("=" * 75)
print("PROBABILITY DISTRIBUTION")
print("=" * 75)


prob_series = pd.Series(
    probabilities
)


print(
    prob_series.describe(
        percentiles=[
            0.01,
            0.05,
            0.10,
            0.25,
            0.50,
            0.75,
            0.90,
            0.95,
            0.99
        ]
    )
)


# ============================================================
# SAVE RESULTS
# ============================================================

output_file = Path(
    "../data/processed/nirvaah_risk_thresholds.csv"
)


results_df.to_csv(
    output_file,
    index=False
)


print(
    f"\nThreshold results saved to:"
    f"\n{output_file}"
)


# ============================================================
# SAVE PROBABILITIES
# ============================================================

prediction_df = test_df[
    [
        "time",
        "latitude",
        "longitude"
    ]
].copy()


prediction_df[
    "bloom_probability"
] = probabilities


prediction_file = Path(
    "../data/processed/nirvaah_test_predictions.parquet"
)


prediction_df.to_parquet(
    prediction_file,
    index=False
)


print(
    f"\nPrediction data saved to:"
    f"\n{prediction_file}"
)


print("\n")
print("=" * 75)
print("STEP 12 COMPLETE")
print("=" * 75)