import pandas as pd
import numpy as np
from pathlib import Path
from xgboost import XGBClassifier
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score
)


# ============================================================
# CONFIG
# ============================================================

TRAIN_FILE = Path("../data/processed/nirvaah_train.parquet")
TEST_FILE = Path("../data/processed/nirvaah_test.parquet")

RANDOM_STATE = 42

NON_BLOOM_SAMPLE = 300_000


print("=" * 75)
print("NIRVAAH — FEATURE ABLATION / LEAKAGE TEST")
print("=" * 75)


# ============================================================
# LOAD DATA
# ============================================================

print("\nLoading datasets...")

train_df = pd.read_parquet(TRAIN_FILE)
test_df = pd.read_parquet(TEST_FILE)

print(f"Training rows: {len(train_df):,}")
print(f"Testing rows : {len(test_df):,}")


# ============================================================
# ALL FEATURES
# ============================================================

ALL_FEATURES = [
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
# CREATE SAME TRAINING SAMPLE
# ============================================================

print("\nCreating fixed training sample...")


bloom_df = train_df[
    train_df[TARGET] == 1
].copy()


non_bloom_df = train_df[
    train_df[TARGET] == 0
].copy()


non_bloom_sample = non_bloom_df.sample(
    n=min(NON_BLOOM_SAMPLE, len(non_bloom_df)),
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
    f"Bloom rows     : {len(bloom_df):,}"
)

print(
    f"Non-bloom rows : {len(non_bloom_sample):,}"
)

print(
    f"Total sample   : {len(sample_df):,}"
)


# ============================================================
# FEATURE GROUPS
# ============================================================

# Full model
FULL_FEATURES = ALL_FEATURES


# Remove all CHL-derived information
NO_CHL_FEATURES = [
    f for f in ALL_FEATURES
    if f not in [
        "chl",
        "chl_saturated",
        "log_chl",
        "chl_tsm_ratio",
        "chl_mean",
        "chl_std",
        "chl_z"
    ]
]


# Remove all optical/environmental concentration variables
NO_OPTICAL_FEATURES = [
    f for f in ALL_FEATURES
    if f not in [
        "chl",
        "kd490",
        "tsm",

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
]


# Pure environmental/time/location model
ENVIRONMENTAL_FEATURES = [
    "wave_height",
    "latitude",
    "longitude",
    "month",
    "day_of_year",
    "year",
    "season"
]


EXPERIMENTS = {

    "FULL": FULL_FEATURES,

    "NO_CHL": NO_CHL_FEATURES,

    "NO_OPTICAL": NO_OPTICAL_FEATURES,

    "ENVIRONMENT_ONLY": ENVIRONMENTAL_FEATURES
}


# ============================================================
# PREPARE TEST DATA
# ============================================================

y_test = test_df[TARGET].astype(int)


# ============================================================
# TRAIN FUNCTION
# ============================================================

def run_experiment(name, features):

    print("\n")
    print("=" * 75)
    print(f"EXPERIMENT: {name}")
    print("=" * 75)

    print(f"\nNumber of features: {len(features)}")

    print("Features:")

    print(features)


    X_train = sample_df[features].copy()
    X_test = test_df[features].copy()

    y_train = sample_df[TARGET].astype(int)


    # --------------------------------------------------------
    # CLEAN DATA
    # --------------------------------------------------------

    X_train = X_train.replace(
        [np.inf, -np.inf],
        np.nan
    )

    X_test = X_test.replace(
        [np.inf, -np.inf],
        np.nan
    )


    medians = X_train.median()

    X_train = X_train.fillna(medians)
    X_test = X_test.fillna(medians)


    # --------------------------------------------------------
    # MODEL
    # --------------------------------------------------------

    print("\nTraining XGBoost...")

    model = XGBClassifier(

        n_estimators=300,

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


    # --------------------------------------------------------
    # PREDICTION
    # --------------------------------------------------------

    print("Generating predictions...")

    probability = model.predict_proba(
        X_test
    )[:, 1]


    prediction = (
        probability >= 0.5
    ).astype(int)


    # --------------------------------------------------------
    # METRICS
    # --------------------------------------------------------

    precision = precision_score(
        y_test,
        prediction
    )

    recall = recall_score(
        y_test,
        prediction
    )

    f1 = f1_score(
        y_test,
        prediction
    )

    roc_auc = roc_auc_score(
        y_test,
        probability
    )

    pr_auc = average_precision_score(
        y_test,
        probability
    )


    print("\nRESULTS")

    print(f"Precision : {precision:.4f}")
    print(f"Recall    : {recall:.4f}")
    print(f"F1 Score  : {f1:.4f}")
    print(f"ROC-AUC   : {roc_auc:.4f}")
    print(f"PR-AUC     : {pr_auc:.4f}")


    return {
        "experiment": name,
        "features": len(features),
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "roc_auc": roc_auc,
        "pr_auc": pr_auc
    }


# ============================================================
# RUN EXPERIMENTS
# ============================================================

results = []


for name, features in EXPERIMENTS.items():

    result = run_experiment(
        name,
        features
    )

    results.append(result)


# ============================================================
# FINAL COMPARISON
# ============================================================

results_df = pd.DataFrame(results)


print("\n")
print("=" * 75)
print("NIRVAAH — ABLATION RESULTS")
print("=" * 75)


print(
    results_df.to_string(
        index=False
    )
)


# ============================================================
# SAVE RESULTS
# ============================================================

output_file = Path(
    "../data/processed/nirvaah_ablation_results.csv"
)


results_df.to_csv(
    output_file,
    index=False
)


print(
    f"\nResults saved to: {output_file}"
)


print("\n")
print("=" * 75)
print("ABLATION TEST COMPLETE")
print("=" * 75)