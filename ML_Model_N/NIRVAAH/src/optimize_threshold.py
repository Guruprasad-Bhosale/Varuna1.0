import pandas as pd
import numpy as np

from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    accuracy_score,
    confusion_matrix
)


# =========================================================
# SAGARDRISHTI
# BLOOM PROBABILITY THRESHOLD OPTIMIZATION
# =========================================================

TEST_FILE = "../data/processed/nirvaah_test.parquet"

PREDICTION_FILE = (
    "../data/processed/"
    "nirvaah_test_predictions.parquet"
)


# =========================================================
# 1. LOAD TEST DATA
# =========================================================

print("=" * 65)
print("SAGARDRISHTI THRESHOLD OPTIMIZATION")
print("=" * 65)

print("\nLoading test data...")

test_df = pd.read_parquet(
    TEST_FILE
)

print(
    "Test shape:",
    test_df.shape
)


# =========================================================
# 2. LOAD PREDICTIONS
# =========================================================

print("\nLoading predictions...")

pred_df = pd.read_parquet(
    PREDICTION_FILE
)

print(
    "Prediction shape:",
    pred_df.shape
)


# =========================================================
# 3. CHECK REQUIRED COLUMNS
# =========================================================

required_test = [
    "time",
    "latitude",
    "longitude",
    "bloom_proxy"
]

required_pred = [
    "time",
    "latitude",
    "longitude",
    "bloom_probability"
]


missing_test = [
    c for c in required_test
    if c not in test_df.columns
]

missing_pred = [
    c for c in required_pred
    if c not in pred_df.columns
]


if missing_test:

    raise ValueError(
        f"Missing columns in test data: {missing_test}"
    )


if missing_pred:

    raise ValueError(
        f"Missing columns in predictions: {missing_pred}"
    )


# =========================================================
# 4. CONVERT TYPES
# =========================================================

test_df["time"] = pd.to_datetime(
    test_df["time"],
    errors="coerce"
)

pred_df["time"] = pd.to_datetime(
    pred_df["time"],
    errors="coerce"
)


test_df["latitude"] = pd.to_numeric(
    test_df["latitude"],
    errors="coerce"
)

test_df["longitude"] = pd.to_numeric(
    test_df["longitude"],
    errors="coerce"
)

pred_df["latitude"] = pd.to_numeric(
    pred_df["latitude"],
    errors="coerce"
)

pred_df["longitude"] = pd.to_numeric(
    pred_df["longitude"],
    errors="coerce"
)


# =========================================================
# 5. MERGE ACTUAL + PREDICTED PROBABILITY
# =========================================================

print("\nMatching actual labels with predictions...")


keys = [
    "time",
    "latitude",
    "longitude"
]


actual = test_df[
    keys + ["bloom_proxy"]
].copy()


predictions = pred_df[
    keys + ["bloom_probability"]
].copy()


# Remove invalid rows

actual = actual.dropna(
    subset=keys + ["bloom_proxy"]
)

predictions = predictions.dropna(
    subset=keys + ["bloom_probability"]
)


# Remove duplicate prediction keys if any

predictions = predictions.drop_duplicates(
    subset=keys
)


merged = actual.merge(
    predictions,
    on=keys,
    how="inner"
)


print(
    "\nMatched rows:",
    len(merged)
)


if len(merged) == 0:

    raise ValueError(
        "No rows matched between test data "
        "and prediction data."
    )


# =========================================================
# 6. ACTUAL LABEL
# =========================================================

y_true = (
    merged["bloom_proxy"]
    .astype(int)
    .values
)


y_probability = (
    merged["bloom_probability"]
    .astype(float)
    .values
)


# =========================================================
# 7. CLASS DISTRIBUTION
# =========================================================

print("\nActual class distribution:")

print(
    pd.Series(y_true)
    .value_counts()
)


print("\nBloom percentage:")

print(
    f"{np.mean(y_true) * 100:.4f}%"
)


# =========================================================
# 8. TEST MULTIPLE THRESHOLDS
# =========================================================

thresholds = np.arange(
    0.05,
    0.81,
    0.05
)


results = []


for threshold in thresholds:

    y_pred = (
        y_probability >= threshold
    ).astype(int)


    precision = precision_score(
        y_true,
        y_pred,
        zero_division=0
    )


    recall = recall_score(
        y_true,
        y_pred,
        zero_division=0
    )


    f1 = f1_score(
        y_true,
        y_pred,
        zero_division=0
    )


    accuracy = accuracy_score(
        y_true,
        y_pred
    )


    tn, fp, fn, tp = confusion_matrix(
        y_true,
        y_pred,
        labels=[0, 1]
    ).ravel()


    results.append({

        "threshold": threshold,

        "accuracy": accuracy,

        "precision": precision,

        "recall": recall,

        "f1": f1,

        "true_positive": tp,

        "false_positive": fp,

        "false_negative": fn,

        "true_negative": tn

    })


results_df = pd.DataFrame(
    results
)


# =========================================================
# 9. DISPLAY RESULTS
# =========================================================

print("\n")
print("=" * 65)
print("THRESHOLD COMPARISON")
print("=" * 65)


display_columns = [
    "threshold",
    "accuracy",
    "precision",
    "recall",
    "f1"
]


print(
    results_df[
        display_columns
    ].to_string(
        index=False,
        formatters={
            "threshold": "{:.2f}".format,
            "accuracy": "{:.4f}".format,
            "precision": "{:.4f}".format,
            "recall": "{:.4f}".format,
            "f1": "{:.4f}".format
        }
    )
)


# =========================================================
# 10. BEST F1 THRESHOLD
# =========================================================

best_f1_row = (
    results_df
    .loc[
        results_df["f1"].idxmax()
    ]
)


print("\n")
print("=" * 65)
print("BEST F1 THRESHOLD")
print("=" * 65)


print(
    f"Threshold : "
    f"{best_f1_row['threshold']:.2f}"
)

print(
    f"Accuracy  : "
    f"{best_f1_row['accuracy']:.4f}"
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
    f"F1 Score  : "
    f"{best_f1_row['f1']:.4f}"
)


# =========================================================
# 11. BEST RECALL WITH PRECISION >= 0.50
# =========================================================

acceptable = results_df[
    results_df["precision"] >= 0.50
]


if len(acceptable) > 0:

    best_recall_row = (
        acceptable
        .loc[
            acceptable["recall"].idxmax()
        ]
    )


    print("\n")
    print("=" * 65)
    print("BEST RECALL WITH PRECISION >= 50%")
    print("=" * 65)


    print(
        f"Threshold : "
        f"{best_recall_row['threshold']:.2f}"
    )

    print(
        f"Accuracy  : "
        f"{best_recall_row['accuracy']:.4f}"
    )

    print(
        f"Precision : "
        f"{best_recall_row['precision']:.4f}"
    )

    print(
        f"Recall    : "
        f"{best_recall_row['recall']:.4f}"
    )

    print(
        f"F1 Score  : "
        f"{best_recall_row['f1']:.4f}"
    )


# =========================================================
# 12. SAVE RESULTS
# =========================================================

OUTPUT_FILE = (
    "../data/processed/"
    "sagardrishti_threshold_results.csv"
)


results_df.to_csv(
    OUTPUT_FILE,
    index=False
)


print("\nSaved threshold analysis:")

print(
    OUTPUT_FILE
)


print("\nDONE!")