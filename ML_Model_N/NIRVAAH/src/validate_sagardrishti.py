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
    confusion_matrix
)

from xgboost import XGBClassifier


# ============================================================
# SAGARDRISHTI
# PROPER VALIDATION + THRESHOLD SELECTION
# ============================================================

DATA_FILE = (
    "../data/processed/"
    "nirvaah_bloom_proxy.parquet"
)

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
# LOAD DATA
# ============================================================

print("=" * 65)
print("SAGARDRISHTI VALIDATION PIPELINE")
print("=" * 65)

print("\nLoading dataset...")

df = pd.read_parquet(DATA_FILE)

print("Original shape:", df.shape)


# ============================================================
# SELECT FEATURES
# ============================================================

df = df[
    FEATURES + [TARGET]
].copy()


# ============================================================
# NUMERIC CLEANING
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
# SAME AS ORIGINAL NIRVAAH/SAGARDRISHTI
# ============================================================

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


print(
    "Samples after cleaning:",
    len(df)
)


# ============================================================
# X / Y
# ============================================================

X = df[FEATURES].copy()

y = df[TARGET].astype(int).copy()


print("\nTarget distribution:")

print(
    y.value_counts()
)


print(
    f"\nBloom percentage: "
    f"{y.mean() * 100:.4f}%"
)


# ============================================================
# STEP 1
# FINAL TEST SPLIT
#
# THIS TEST SET WILL NEVER BE USED TO
# SELECT THE THRESHOLD.
# ============================================================

X_development, X_test, y_development, y_test = (
    train_test_split(

        X,
        y,

        test_size=0.20,

        random_state=42,

        stratify=y
    )
)


print("\n==============================================")
print("DATA SPLIT")
print("==============================================")

print(
    "Development samples:",
    len(X_development)
)

print(
    "Final test samples:",
    len(X_test)
)


# ============================================================
# STEP 2
# DEVELOPMENT → TRAIN + VALIDATION
# ============================================================

X_train, X_validation, y_train, y_validation = (
    train_test_split(

        X_development,
        y_development,

        test_size=0.20,

        random_state=42,

        stratify=y_development
    )
)


print(
    "\nTraining samples:",
    len(X_train)
)

print(
    "Validation samples:",
    len(X_validation)
)


# ============================================================
# MODEL FUNCTION
# ============================================================

def create_model():

    return XGBClassifier(

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
# STEP 3
# TRAIN ON TRAINING PORTION
# ============================================================

print("\n==============================================")
print("TRAINING VALIDATION MODEL")
print("==============================================")


validation_model = create_model()


validation_model.fit(
    X_train,
    y_train
)


# ============================================================
# VALIDATION PROBABILITIES
# ============================================================

validation_probability = (
    validation_model
    .predict_proba(X_validation)[:, 1]
)


# ============================================================
# THRESHOLD SEARCH
# ============================================================

thresholds = np.arange(
    0.05,
    0.96,
    0.05
)


validation_results = []


for threshold in thresholds:

    validation_pred = (
        validation_probability >= threshold
    ).astype(int)


    precision = precision_score(
        y_validation,
        validation_pred,
        zero_division=0
    )


    recall = recall_score(
        y_validation,
        validation_pred,
        zero_division=0
    )


    f1 = f1_score(
        y_validation,
        validation_pred,
        zero_division=0
    )


    accuracy = accuracy_score(
        y_validation,
        validation_pred
    )


    validation_results.append({

        "threshold": threshold,

        "accuracy": accuracy,

        "precision": precision,

        "recall": recall,

        "f1": f1
    })


validation_results = pd.DataFrame(
    validation_results
)


# ============================================================
# DISPLAY VALIDATION RESULTS
# ============================================================

print("\n==============================================")
print("VALIDATION THRESHOLD RESULTS")
print("==============================================")


print(
    validation_results.to_string(
        index=False,

        formatters={

            "threshold":
                "{:.2f}".format,

            "accuracy":
                "{:.4f}".format,

            "precision":
                "{:.4f}".format,

            "recall":
                "{:.4f}".format,

            "f1":
                "{:.4f}".format
        }
    )
)


# ============================================================
# SELECT BEST F1 THRESHOLD
# ============================================================

best_row = (
    validation_results
    .loc[
        validation_results["f1"].idxmax()
    ]
)


BEST_THRESHOLD = float(
    best_row["threshold"]
)


print("\n==============================================")
print("SELECTED THRESHOLD")
print("==============================================")


print(
    f"Threshold : {BEST_THRESHOLD:.2f}"
)

print(
    f"Validation Accuracy  : "
    f"{best_row['accuracy']:.4f}"
)

print(
    f"Validation Precision : "
    f"{best_row['precision']:.4f}"
)

print(
    f"Validation Recall    : "
    f"{best_row['recall']:.4f}"
)

print(
    f"Validation F1        : "
    f"{best_row['f1']:.4f}"
)


# ============================================================
# STEP 4
# RETRAIN MODEL ON COMPLETE DEVELOPMENT DATA
#
# IMPORTANT:
# Threshold is already frozen.
# ============================================================

print("\n==============================================")
print("RETRAINING FINAL MODEL")
print("==============================================")


final_model = create_model()


final_model.fit(
    X_development,
    y_development
)


# ============================================================
# STEP 5
# FINAL TEST PREDICTIONS
# ============================================================

test_probability = (
    final_model
    .predict_proba(X_test)[:, 1]
)


# Use ONLY the threshold selected from validation

test_pred = (
    test_probability >= BEST_THRESHOLD
).astype(int)


# ============================================================
# FINAL METRICS
# ============================================================

accuracy = accuracy_score(
    y_test,
    test_pred
)


precision = precision_score(
    y_test,
    test_pred,
    zero_division=0
)


recall = recall_score(
    y_test,
    test_pred,
    zero_division=0
)


f1 = f1_score(
    y_test,
    test_pred,
    zero_division=0
)


roc_auc = roc_auc_score(
    y_test,
    test_probability
)


pr_auc = average_precision_score(
    y_test,
    test_probability
)


# ============================================================
# FINAL RESULTS
# ============================================================

print("\n")
print("=" * 65)
print("SAGARDRISHTI FINAL TEST RESULTS")
print("=" * 65)


print(
    f"\nDecision Threshold : "
    f"{BEST_THRESHOLD:.2f}"
)

print(
    f"Accuracy  : "
    f"{accuracy:.6f} "
    f"({accuracy*100:.2f}%)"
)

print(
    f"Precision : "
    f"{precision:.6f} "
    f"({precision*100:.2f}%)"
)

print(
    f"Recall    : "
    f"{recall:.6f} "
    f"({recall*100:.2f}%)"
)

print(
    f"F1 Score  : "
    f"{f1:.6f} "
    f"({f1*100:.2f}%)"
)

print(
    f"ROC-AUC   : "
    f"{roc_auc:.6f} "
    f"({roc_auc*100:.2f}%)"
)

print(
    f"PR-AUC    : "
    f"{pr_auc:.6f} "
    f"({pr_auc*100:.2f}%)"
)


# ============================================================
# CONFUSION MATRIX
# ============================================================

tn, fp, fn, tp = confusion_matrix(
    y_test,
    test_pred,
    labels=[0, 1]
).ravel()


print("\n==============================================")
print("CONFUSION MATRIX")
print("==============================================")


print(
    f"True Negative  : {tn:,}"
)

print(
    f"False Positive : {fp:,}"
)

print(
    f"False Negative : {fn:,}"
)

print(
    f"True Positive  : {tp:,}"
)


# ============================================================
# SAVE FINAL MODEL
# ============================================================

MODEL_FILE = (
    "../data/processed/"
    "sagardrishti_final_xgboost.json"
)


final_model.save_model(
    MODEL_FILE
)


# ============================================================
# SAVE THRESHOLD
# ============================================================

THRESHOLD_FILE = (
    "../data/processed/"
    "sagardrishti_threshold.txt"
)


with open(
    THRESHOLD_FILE,
    "w"
) as f:

    f.write(
        str(BEST_THRESHOLD)
    )


# ============================================================
# SAVE FINAL RESULTS
# ============================================================

RESULT_FILE = (
    "../data/processed/"
    "sagardrishti_final_results.csv"
)


pd.DataFrame([{

    "threshold":
        BEST_THRESHOLD,

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
        pr_auc,

    "true_negative":
        tn,

    "false_positive":
        fp,

    "false_negative":
        fn,

    "true_positive":
        tp

}]).to_csv(
    RESULT_FILE,
    index=False
)


# ============================================================
# SAVE VALIDATION TABLE
# ============================================================

VALIDATION_FILE = (
    "../data/processed/"
    "sagardrishti_validation_thresholds.csv"
)


validation_results.to_csv(
    VALIDATION_FILE,
    index=False
)


# ============================================================
# SAVE FINAL TEST PREDICTIONS
# ============================================================

PREDICTION_FILE = (
    "../data/processed/"
    "sagardrishti_final_test_predictions.parquet"
)


prediction_output = pd.DataFrame({

    "actual_bloom":
        y_test.values,

    "bloom_probability":
        test_probability,

    "bloom_prediction":
        test_pred

})


prediction_output.to_parquet(
    PREDICTION_FILE,
    index=False
)


# ============================================================
# COMPLETE
# ============================================================

print("\n==============================================")
print("VALIDATION PIPELINE COMPLETE")
print("==============================================")


print("\nSaved:")

print(
    MODEL_FILE
)

print(
    THRESHOLD_FILE
)

print(
    RESULT_FILE
)

print(
    VALIDATION_FILE
)

print(
    PREDICTION_FILE
)

print("\nDONE!")