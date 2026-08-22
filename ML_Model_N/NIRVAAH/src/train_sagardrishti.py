import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    classification_report
)

from xgboost import XGBClassifier


# ============================================================
# SAGARDRISHTI - RESEARCH-BACKED BASE MODEL
# ============================================================

DATA_FILE = "../data/processed/nirvaah_bloom_proxy.parquet"

TARGET = "bloom_proxy"


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
    "season"
]


# ============================================================
# LOAD
# ============================================================

print("\nLoading Sagardrishti dataset...")

df = pd.read_parquet(DATA_FILE)

print("Original shape:", df.shape)


# ============================================================
# CHECK
# ============================================================

missing_features = [
    f for f in FEATURES
    if f not in df.columns
]

if missing_features:

    raise ValueError(
        f"Missing features: {missing_features}"
    )

if TARGET not in df.columns:

    raise ValueError(
        f"Target not found: {TARGET}"
    )


# ============================================================
# SELECT
# ============================================================

df = df[
    FEATURES + [TARGET]
].copy()


# ============================================================
# CLEAN NUMERIC FEATURES
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
# SEASON
# ============================================================

# =========================================================
# SEASON ENCODING
# SAME METHOD AS ORIGINAL NIRVAAH MODEL
# =========================================================

df["season"] = (
    df["season"]
    .astype("category")
    .cat.codes
)


# ============================================================
# CLEAN
# ============================================================

df = df.replace(
    [np.inf, -np.inf],
    np.nan
)

df = df.dropna(
    subset=FEATURES + [TARGET]
).reset_index(drop=True)


print("Samples after cleaning:", len(df))


# ============================================================
# X / Y
# ============================================================

X = df[FEATURES]

y = df[TARGET].astype(int)


print("\nTarget distribution:")
print(y.value_counts())


# ============================================================
# TRAIN TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(

    X,
    y,

    test_size=0.20,

    random_state=42,

    stratify=y
)


# ============================================================
# XGBOOST
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
# TRAIN
# ============================================================

print("\n==============================================")
print("TRAINING SAGARDRISHTI MODEL")
print("==============================================")

model.fit(
    X_train,
    y_train
)


# ============================================================
# PREDICTION
# ============================================================

y_pred = model.predict(X_test)

y_probability = model.predict_proba(
    X_test
)[:, 1]


# ============================================================
# METRICS
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
# RESULTS
# ============================================================

print("\n==============================================")
print("SAGARDRISHTI RESULTS")
print("==============================================")

print(
    f"Accuracy  : {accuracy:.6f}"
    f" ({accuracy*100:.2f}%)"
)

print(
    f"Precision : {precision:.6f}"
    f" ({precision*100:.2f}%)"
)

print(
    f"Recall    : {recall:.6f}"
    f" ({recall*100:.2f}%)"
)

print(
    f"F1 Score  : {f1:.6f}"
    f" ({f1*100:.2f}%)"
)

print(
    f"ROC-AUC   : {roc_auc:.6f}"
    f" ({roc_auc*100:.2f}%)"
)

print(
    f"PR-AUC    : {pr_auc:.6f}"
    f" ({pr_auc*100:.2f}%)"
)


# ============================================================
# CLASSIFICATION REPORT
# ============================================================

print("\nClassification Report:")

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
# FEATURE IMPORTANCE
# ============================================================

importance_df = pd.DataFrame({

    "Feature": FEATURES,

    "Importance":
        model.feature_importances_

})


importance_df = importance_df.sort_values(
    "Importance",
    ascending=False
)


importance_df[
    "Importance_Percent"
] = (

    importance_df["Importance"]

    /
    importance_df["Importance"].sum()

) * 100


print("\n==============================================")
print("SAGARDRISHTI FEATURE IMPORTANCE")
print("==============================================")

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
# SAVE
# ============================================================

importance_df.to_csv(
    "../data/processed/"
    "sagardrishti_feature_importance.csv",

    index=False
)


results = pd.DataFrame([{

    "experiment":
        "SAGARDRISHTI_BASELINE",

    "features":
        len(FEATURES),

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
    "sagardrishti_results.csv",

    index=False
)


# ============================================================
# SAVE MODEL
# ============================================================

model.save_model(
    "../data/processed/"
    "sagardrishti_xgboost.json"
)


print("\n==============================================")
print("SAGARDRISHTI TRAINING COMPLETE")
print("==============================================")

print("\nSaved:")

print(
    "../data/processed/"
    "sagardrishti_xgboost.json"
)

print(
    "../data/processed/"
    "sagardrishti_feature_importance.csv"
)

print(
    "../data/processed/"
    "sagardrishti_results.csv"
)