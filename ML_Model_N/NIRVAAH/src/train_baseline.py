import pandas as pd
import numpy as np

from pathlib import Path

from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

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
    "../data/processed/nirvaah_logistic_model.joblib"
)

SCALER_FILE = Path(
    "../data/processed/nirvaah_scaler.joblib"
)


print("=" * 70)
print("NIRVAAH — BASELINE LOGISTIC REGRESSION")
print("=" * 70)


# ============================================================
# 1. LOAD DATA
# ============================================================

print("\nLoading training data...")

train_df = pd.read_parquet(TRAIN_FILE)

print(
    f"Training rows: {len(train_df):,}"
)


print("\nLoading testing data...")

test_df = pd.read_parquet(TEST_FILE)

print(
    f"Testing rows: {len(test_df):,}"
)


# ============================================================
# 2. DEFINE FEATURES
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
# 3. PREPARE X / Y
# ============================================================

print("\nPreparing X and y...")


X_train = train_df[FEATURES].copy()

y_train = train_df[TARGET].astype(int)


X_test = test_df[FEATURES].copy()

y_test = test_df[TARGET].astype(int)


print(
    f"X_train: {X_train.shape}"
)

print(
    f"X_test:  {X_test.shape}"
)


# ============================================================
# 4. HANDLE MISSING VALUES
# ============================================================

print("\nChecking missing values...")


X_train = X_train.replace(
    [np.inf, -np.inf],
    np.nan
)

X_test = X_test.replace(
    [np.inf, -np.inf],
    np.nan
)


# Use training medians ONLY.

train_medians = X_train.median()


X_train = X_train.fillna(
    train_medians
)

X_test = X_test.fillna(
    train_medians
)


# ============================================================
# 5. SCALE FEATURES
# ============================================================

print("\nScaling features...")


scaler = StandardScaler()


X_train_scaled = scaler.fit_transform(
    X_train
)

X_test_scaled = scaler.transform(
    X_test
)


# ============================================================
# 6. TRAIN MODEL
# ============================================================

print("\nTraining Logistic Regression...")


model = LogisticRegression(
    class_weight="balanced",
    max_iter=1000,
    solver="lbfgs"
)


model.fit(
    X_train_scaled,
    y_train
)


print("Model training complete.")


# ============================================================
# 7. PREDICTIONS
# ============================================================

print("\nGenerating predictions...")


y_pred = model.predict(
    X_test_scaled
)


y_probability = model.predict_proba(
    X_test_scaled
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
# 10. IMPORTANT METRICS
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
print("NIRVAAH BASELINE METRICS")
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
# 11. SAVE MODEL
# ============================================================

print("\nSaving model...")


joblib.dump(
    model,
    MODEL_FILE
)


joblib.dump(
    scaler,
    SCALER_FILE
)


print(
    f"Model saved: {MODEL_FILE}"
)

print(
    f"Scaler saved: {SCALER_FILE}"
)


# ============================================================
# 12. FEATURE COEFFICIENTS
# ============================================================

print("\n" + "=" * 70)
print("FEATURE COEFFICIENTS")
print("=" * 70)


coefficients = pd.DataFrame({
    "feature": FEATURES,
    "coefficient": model.coef_[0]
})


coefficients["absolute"] = (
    coefficients["coefficient"]
    .abs()
)


coefficients = coefficients.sort_values(
    "absolute",
    ascending=False
)


print(
    coefficients[
        ["feature", "coefficient"]
    ].to_string(index=False)
)


# ============================================================
# COMPLETE
# ============================================================

print("\n" + "=" * 70)
print("STEP 8 COMPLETE")
print("=" * 70)