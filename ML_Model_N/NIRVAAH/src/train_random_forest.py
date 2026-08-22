import pandas as pd
import numpy as np

from pathlib import Path

from sklearn.ensemble import RandomForestClassifier

from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score,
    average_precision_score,
    precision_score,
    recall_score,
    f1_score
)

import joblib


# ============================================================
# CONFIG
# ============================================================

TRAIN_FILE = Path(
    "../data/processed/nirvaah_train.parquet"
)

TEST_FILE = Path(
    "../data/processed/nirvaah_test.parquet"
)

MODEL_FILE = Path(
    "../data/processed/nirvaah_random_forest.joblib"
)


RANDOM_STATE = 42

# Number of non-bloom observations to use.
NON_BLOOM_SAMPLE = 300_000


print("=" * 70)
print("NIRVAAH — RANDOM FOREST")
print("=" * 70)


# ============================================================
# 1. LOAD DATA
# ============================================================

print("\nLoading training data...")

train_df = pd.read_parquet(
    TRAIN_FILE
)

print(
    f"Training rows: {len(train_df):,}"
)


print("\nLoading testing data...")

test_df = pd.read_parquet(
    TEST_FILE
)

print(
    f"Testing rows: {len(test_df):,}"
)


# ============================================================
# 2. FEATURES
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
# 3. PREPARE TRAINING SAMPLE
# ============================================================

print("\nPreparing stratified training sample...")


bloom_df = train_df[
    train_df[TARGET] == 1
].copy()


non_bloom_df = train_df[
    train_df[TARGET] == 0
].copy()


print(
    f"Bloom observations: {len(bloom_df):,}"
)

print(
    f"Non-bloom observations: {len(non_bloom_df):,}"
)


# ------------------------------------------------------------
# Sample non-bloom observations
# ------------------------------------------------------------

non_bloom_sample = non_bloom_df.sample(
    n=min(
        NON_BLOOM_SAMPLE,
        len(non_bloom_df)
    ),
    random_state=RANDOM_STATE
)


rf_train = pd.concat(
    [
        bloom_df,
        non_bloom_sample
    ],
    ignore_index=True
)


# Shuffle

rf_train = rf_train.sample(
    frac=1,
    random_state=RANDOM_STATE
).reset_index(drop=True)


print(
    f"\nFinal RF training rows: {len(rf_train):,}"
)


print("\nRF training target distribution:")

print(
    rf_train[TARGET]
    .value_counts()
)


# ============================================================
# 4. X / Y
# ============================================================

X_train = rf_train[
    FEATURES
].copy()

y_train = rf_train[
    TARGET
].astype(int)


X_test = test_df[
    FEATURES
].copy()

y_test = test_df[
    TARGET
].astype(int)


# ============================================================
# 5. CLEAN VALUES
# ============================================================

print("\nCleaning missing/infinite values...")


X_train = X_train.replace(
    [np.inf, -np.inf],
    np.nan
)

X_test = X_test.replace(
    [np.inf, -np.inf],
    np.nan
)


# Training medians only

train_medians = X_train.median()


X_train = X_train.fillna(
    train_medians
)

X_test = X_test.fillna(
    train_medians
)


# ============================================================
# 6. TRAIN RANDOM FOREST
# ============================================================

print("\nTraining Random Forest...")

print("This may take some time.")


model = RandomForestClassifier(

    n_estimators=100,

    max_depth=18,

    min_samples_leaf=5,

    max_features="sqrt",

    class_weight="balanced_subsample",

    n_jobs=-1,

    random_state=RANDOM_STATE

)


model.fit(
    X_train,
    y_train
)


print("\nRandom Forest training complete.")


# ============================================================
# 7. PREDICTIONS
# ============================================================

print("\nGenerating predictions...")


y_pred = model.predict(
    X_test
)


y_probability = model.predict_proba(
    X_test
)[:, 1]


# ============================================================
# 8. CLASSIFICATION REPORT
# ============================================================

print("\n" + "=" * 70)
print("CLASSIFICATION REPORT")
print("=" * 70)


print(
    classification_report(
        y_test,
        y_pred,
        target_names=[
            "NON-BLOOM",
            "BLOOM"
        ],
        digits=4
    )
)


# ============================================================
# 9. CONFUSION MATRIX
# ============================================================

print("\n" + "=" * 70)
print("CONFUSION MATRIX")
print("=" * 70)


cm = confusion_matrix(
    y_test,
    y_pred
)


print(cm)


tn, fp, fn, tp = cm.ravel()


print("\nTrue Negatives :", tn)
print("False Positives:", fp)
print("False Negatives:", fn)
print("True Positives :", tp)


# ============================================================
# 10. METRICS
# ============================================================

precision = precision_score(
    y_test,
    y_pred
)

recall = recall_score(
    y_test,
    y_pred
)

f1 = f1_score(
    y_test,
    y_pred
)

roc_auc = roc_auc_score(
    y_test,
    y_probability
)

pr_auc = average_precision_score(
    y_test,
    y_probability
)


print("\n" + "=" * 70)
print("NIRVAAH RANDOM FOREST METRICS")
print("=" * 70)


print(
    f"\nPrecision : {precision:.4f}"
)

print(
    f"Recall    : {recall:.4f}"
)

print(
    f"F1 Score  : {f1:.4f}"
)

print(
    f"ROC-AUC   : {roc_auc:.4f}"
)

print(
    f"PR-AUC    : {pr_auc:.4f}"
)


# ============================================================
# 11. FEATURE IMPORTANCE
# ============================================================

print("\n" + "=" * 70)
print("FEATURE IMPORTANCE")
print("=" * 70)


importance_df = pd.DataFrame({

    "feature": FEATURES,

    "importance":
        model.feature_importances_

})


importance_df = importance_df.sort_values(
    "importance",
    ascending=False
)


print(
    importance_df.to_string(
        index=False
    )
)


# ============================================================
# 12. SAVE MODEL
# ============================================================

print("\nSaving Random Forest model...")


joblib.dump(
    model,
    MODEL_FILE
)


print(
    f"Model saved: {MODEL_FILE}"
)


# ============================================================
# COMPLETE
# ============================================================

print("\n" + "=" * 70)
print("STEP 9 COMPLETE")
print("=" * 70)