import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
    roc_auc_score,
    average_precision_score
)

from xgboost import XGBClassifier


# ============================================================
# NIRVAAH — 10 FEATURE MODEL
# ============================================================

DATA_FILE = "../data/processed/nirvaah_bloom_proxy.parquet"

TARGET = "bloom_proxy"

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
    "season"
]


# ============================================================
# 1. LOAD DATA
# ============================================================

print("\nLoading NIRVAAH dataset...")

df = pd.read_parquet(DATA_FILE)

print("Dataset shape:", df.shape)


# ============================================================
# 2. CHECK FEATURES
# ============================================================

print("\nChecking features...")

missing_features = [
    feature
    for feature in FEATURES
    if feature not in df.columns
]

if missing_features:

    raise ValueError(
        f"Missing features: {missing_features}"
    )


if TARGET not in df.columns:

    raise ValueError(
        f"Target '{TARGET}' not found."
    )


print("All 10 features found.")
print("Target found:", TARGET)


# ============================================================
# 3. SELECT ONLY 10 FEATURES + TARGET
# ============================================================

df = df[
    FEATURES + [TARGET]
].copy()


# ============================================================
# 4. DATA INFORMATION
# ============================================================

print("\n============================================")
print("NIRVAAH 10-FEATURE MODEL")
print("============================================")

print("\nFeatures used:")

for i, feature in enumerate(FEATURES, 1):
    print(f"{i}. {feature}")

print("\nTarget:", TARGET)


# ============================================================
# 5. CHECK TARGET
# ============================================================

print("\nBloom Proxy distribution:")

print(
    df[TARGET].value_counts(
        dropna=False
    )
)

print("\nBloom Proxy percentage:")

print(
    (
        df[TARGET]
        .value_counts(normalize=True)
        .mul(100)
        .round(4)
    )
)


# ============================================================
# 6. CLEAN FEATURES
# ============================================================

# ============================================================
# CLEAN NUMERICAL FEATURES
# ============================================================

NUMERIC_FEATURES = [
    "chl",
    "kd490",
    "tsm",
    "wave_height",
    "latitude",
    "longitude",
    "month",
    "day_of_year",
    "year"
]

for feature in NUMERIC_FEATURES:

    df[feature] = pd.to_numeric(
        df[feature],
        errors="coerce"
    )


# ============================================================
# ENCODE SEASON
# ============================================================

print("\nSeason values before encoding:")
print(df["season"].value_counts(dropna=False))

# Convert categorical season into numeric codes
df["season"] = df["season"].astype("category").cat.codes

print("\nSeason values after encoding:")
print(df["season"].value_counts(dropna=False))


# IMPORTANT:
# Do NOT convert bloom_proxy using pd.to_numeric.
# It is already int8 (0/1).

df = df.replace(
    [np.inf, -np.inf],
    np.nan
)


print("\nMissing values:")

print(
    df[
        FEATURES + [TARGET]
    ].isna().sum()
)


# Remove rows where INPUT FEATURES are missing
df = df.dropna(
    subset=FEATURES
).reset_index(drop=True)


print("\nSamples after cleaning:", len(df))


# ============================================================
# 7. X AND Y
# ============================================================

X = df[FEATURES].copy()

y = df[TARGET].astype(int)


print("\nX shape:", X.shape)
print("y shape:", y.shape)


# ============================================================
# 8. TRAIN / TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


print("\n============================================")
print("TRAIN / TEST SPLIT")
print("============================================")

print("Training samples:", len(X_train))
print("Testing samples :", len(X_test))


# ============================================================
# 9. XGBOOST
# ============================================================

model = XGBClassifier(

    n_estimators=300,

    max_depth=6,

    learning_rate=0.05,

    subsample=0.8,

    colsample_bytree=0.8,

    objective="binary:logistic",

    eval_metric="logloss",

    random_state=42,

    n_jobs=-1
)


# ============================================================
# 10. TRAIN
# ============================================================

print("\n============================================")
print("TRAINING XGBOOST")
print("============================================")

print("\nTraining on ONLY these 10 features:")

for feature in FEATURES:
    print(" -", feature)


model.fit(
    X_train,
    y_train
)


print("\nTraining completed!")


# ============================================================
# 11. PREDICTION
# ============================================================

y_pred = model.predict(
    X_test
)

y_probability = model.predict_proba(
    X_test
)[:, 1]


# ============================================================
# 12. METRICS
# ============================================================

accuracy = accuracy_score(
    y_test,
    y_pred
)

precision = precision_score(
    y_test,
    y_pred,
    zero_division=0
)

recall = recall_score(
    y_test,
    y_pred,
    zero_division=0
)

f1 = f1_score(
    y_test,
    y_pred,
    zero_division=0
)

roc_auc = roc_auc_score(
    y_test,
    y_probability
)

pr_auc = average_precision_score(
    y_test,
    y_probability
)


# ============================================================
# 13. RESULTS
# ============================================================

print("\n")
print("=" * 65)
print("🔥 NIRVAAH — 10 FEATURE MODEL RESULTS")
print("=" * 65)

print(
    f"\nAccuracy  : {accuracy:.6f} "
    f"({accuracy * 100:.2f}%)"
)

print(
    f"Precision : {precision:.6f} "
    f"({precision * 100:.2f}%)"
)

print(
    f"Recall    : {recall:.6f} "
    f"({recall * 100:.2f}%)"
)

print(
    f"F1 Score  : {f1:.6f} "
    f"({f1 * 100:.2f}%)"
)

print(
    f"ROC-AUC   : {roc_auc:.6f} "
    f"({roc_auc * 100:.2f}%)"
)

print(
    f"PR-AUC    : {pr_auc:.6f} "
    f"({pr_auc * 100:.2f}%)"
)


# ============================================================
# 14. CLASSIFICATION REPORT
# ============================================================

print("\n")
print("=" * 65)
print("CLASSIFICATION REPORT")
print("=" * 65)

print(
    classification_report(
        y_test,
        y_pred,
        target_names=[
            "NORMAL / NO BLOOM",
            "BLOOM RISK"
        ],
        zero_division=0
    )
)


# ============================================================
# 15. CONFUSION MATRIX
# ============================================================

print("\n")
print("=" * 65)
print("CONFUSION MATRIX")
print("=" * 65)

cm = confusion_matrix(
    y_test,
    y_pred
)

print(cm)

print("\n")
print("                 Predicted")
print("              0          1")
print(
    f"Actual 0   {cm[0][0]:8d}  {cm[0][1]:8d}"
)
print(
    f"Actual 1   {cm[1][0]:8d}  {cm[1][1]:8d}"
)


# ============================================================
# 16. FEATURE IMPORTANCE
# ============================================================

importance_df = pd.DataFrame({

    "Feature": FEATURES,

    "Importance": model.feature_importances_

})


importance_df = importance_df.sort_values(

    by="Importance",

    ascending=False

)


importance_df["Importance_Percent"] = (

    importance_df["Importance"]

    / importance_df["Importance"].sum()

) * 100


print("\n")
print("=" * 65)
print("🔥 FEATURE IMPORTANCE")
print("=" * 65)

print(

    importance_df[
        [
            "Feature",
            "Importance_Percent"
        ]
    ].to_string(

        index=False,

        formatters={
            "Importance_Percent":
            "{:.4f}%".format
        }

    )

)


# ============================================================
# 17. SAVE FEATURE IMPORTANCE
# ============================================================

importance_df.to_csv(

    "../data/processed/"
    "nirvaah_10_feature_importance.csv",

    index=False

)


# ============================================================
# 18. SAVE MODEL
# ============================================================

model.save_model(

    "../data/processed/"
    "nirvaah_10_feature_xgboost.json"

)


# ============================================================
# 19. SAVE RESULTS
# ============================================================

results = pd.DataFrame([{

    "experiment":
    "10_FEATURE_MODEL",

    "features":
    10,

    "accuracy":
    accuracy,

    "precision":
    precision,

    "recall":
    recall,

    "f1":
    f1,

    "roc_auc":
    roc_auc,

    "pr_auc":
    pr_auc

}])


results.to_csv(

    "../data/processed/"
    "nirvaah_10_feature_results.csv",

    index=False

)


# ============================================================
# 20. SAVE TEST PREDICTIONS
# ============================================================

test_results = X_test.copy()

test_results["actual_bloom_proxy"] = y_test.values

test_results["predicted_bloom_proxy"] = y_pred

test_results["bloom_probability"] = y_probability


test_results.to_parquet(

    "../data/processed/"
    "nirvaah_10_feature_predictions.parquet",

    index=False

)


# ============================================================
# FINAL
# ============================================================

print("\n")
print("=" * 65)
print("FILES SAVED")
print("=" * 65)

print(
    "\nModel:"
    "\n../data/processed/"
    "nirvaah_10_feature_xgboost.json"
)

print(
    "\nFeature importance:"
    "\n../data/processed/"
    "nirvaah_10_feature_importance.csv"
)

print(
    "\nResults:"
    "\n../data/processed/"
    "nirvaah_10_feature_results.csv"
)

print("\n🔥 10-FEATURE EXPERIMENT COMPLETE!")