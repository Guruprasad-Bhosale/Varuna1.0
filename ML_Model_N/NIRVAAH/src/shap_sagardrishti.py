import pandas as pd
import numpy as np
import shap
import matplotlib.pyplot as plt

from xgboost import XGBClassifier


# ============================================================
# SAGARDRISHTI
# SHAP EXPLAINABILITY
# ============================================================

DATA_FILE = (
    "../data/processed/"
    "nirvaah_bloom_proxy.parquet"
)

MODEL_FILE = (
    "../data/processed/"
    "sagardrishti_final_xgboost.json"
)

OUTPUT_IMPORTANCE = (
    "../data/processed/"
    "sagardrishti_shap_importance.csv"
)

OUTPUT_PLOT = (
    "../data/processed/"
    "sagardrishti_shap_summary.png"
)

OUTPUT_BAR = (
    "../data/processed/"
    "sagardrishti_shap_bar.png"
)


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


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 65)
print("SAGARDRISHTI SHAP EXPLAINABILITY")
print("=" * 65)

print("\nLoading dataset...")

df = pd.read_parquet(
    DATA_FILE
)

print(
    "Original shape:",
    df.shape
)


# ============================================================
# PREPARE DATA
# ============================================================

df = df[
    FEATURES + ["bloom_proxy"]
].copy()


for feature in NUMERIC_FEATURES:

    df[feature] = pd.to_numeric(
        df[feature],
        errors="coerce"
    )


# IMPORTANT:
# Same encoding used during original model training

df["season"] = (
    df["season"]
    .astype("category")
    .cat.codes
)


df = df.replace(
    [np.inf, -np.inf],
    np.nan
)


df = df.dropna(
    subset=FEATURES + ["bloom_proxy"]
).reset_index(drop=True)


print(
    "Clean samples:",
    len(df)
)


# ============================================================
# LOAD FINAL MODEL
# ============================================================

print("\nLoading final XGBoost model...")


model = XGBClassifier()


model.load_model(
    MODEL_FILE
)


print("Model loaded successfully.")


# ============================================================
# SAMPLE DATA
# ============================================================
#
# 4.5 million rows is unnecessarily large for SHAP.
#
# We use a representative 10,000-row stratified sample.
#
# This keeps SHAP fast while preserving both classes.
# ============================================================

SAMPLE_SIZE = 10000

print(
    f"\nCreating representative "
    f"{SAMPLE_SIZE:,}-row SHAP sample..."
)


bloom_rows = df[
    df["bloom_proxy"] == 1
]

normal_rows = df[
    df["bloom_proxy"] == 0
]


bloom_sample_size = min(
    2000,
    len(bloom_rows)
)

normal_sample_size = min(
    SAMPLE_SIZE - bloom_sample_size,
    len(normal_rows)
)


bloom_sample = bloom_rows.sample(
    n=bloom_sample_size,
    random_state=42
)


normal_sample = normal_rows.sample(
    n=normal_sample_size,
    random_state=42
)


sample_df = pd.concat(
    [
        bloom_sample,
        normal_sample
    ]
).sample(
    frac=1,
    random_state=42
).reset_index(drop=True)


X_sample = sample_df[
    FEATURES
]


print(
    "SHAP sample shape:",
    X_sample.shape
)


print(
    "\nSample class distribution:"
)

print(
    sample_df["bloom_proxy"]
    .value_counts()
)


# ============================================================
# CREATE SHAP EXPLAINER
# ============================================================

print("\nCalculating SHAP values...")

explainer = shap.TreeExplainer(
    model
)


shap_values = explainer.shap_values(
    X_sample
)


# ============================================================
# HANDLE SHAP OUTPUT
# ============================================================

if isinstance(
    shap_values,
    list
):

    shap_values = shap_values[0]


shap_values = np.asarray(
    shap_values
)


print(
    "\nSHAP matrix shape:",
    shap_values.shape
)


# ============================================================
# GLOBAL SHAP IMPORTANCE
# ============================================================

mean_abs_shap = np.mean(
    np.abs(shap_values),
    axis=0
)


importance_df = pd.DataFrame({

    "Feature":
        FEATURES,

    "Mean_Absolute_SHAP":
        mean_abs_shap
})


importance_df = (
    importance_df
    .sort_values(
        "Mean_Absolute_SHAP",
        ascending=False
    )
    .reset_index(drop=True)
)


importance_df[
    "Importance_Percent"
] = (
    importance_df["Mean_Absolute_SHAP"]
    /
    importance_df["Mean_Absolute_SHAP"].sum()
    * 100
)


# ============================================================
# SIGNED SHAP
# ============================================================

mean_signed_shap = np.mean(
    shap_values,
    axis=0
)


signed_df = pd.DataFrame({

    "Feature":
        FEATURES,

    "Mean_SHAP_Direction":
        mean_signed_shap

})


importance_df = importance_df.merge(
    signed_df,
    on="Feature"
)


# ============================================================
# DISPLAY RESULTS
# ============================================================

print("\n")
print("=" * 65)
print("SAGARDRISHTI SHAP FEATURE IMPORTANCE")
print("=" * 65)


print(
    importance_df[
        [
            "Feature",
            "Mean_Absolute_SHAP",
            "Importance_Percent",
            "Mean_SHAP_Direction"
        ]
    ].to_string(
        index=False,
        formatters={

            "Mean_Absolute_SHAP":
                "{:.6f}".format,

            "Importance_Percent":
                "{:.4f}%".format,

            "Mean_SHAP_Direction":
                "{:.6f}".format
        }
    )
)


# ============================================================
# INTERPRET DIRECTION
# ============================================================

print("\n")
print("=" * 65)
print("SHAP DIRECTION")
print("=" * 65)


for _, row in importance_df.iterrows():

    feature = row["Feature"]

    direction = row[
        "Mean_SHAP_Direction"
    ]

    if direction > 0:

        interpretation = (
            "generally pushes predictions "
            "toward BLOOM RISK"
        )

    elif direction < 0:

        interpretation = (
            "generally pushes predictions "
            "toward NORMAL / NO BLOOM"
        )

    else:

        interpretation = (
            "approximately neutral"
        )


    print(
        f"{feature:15} : "
        f"{interpretation}"
    )


# ============================================================
# SAVE SHAP TABLE
# ============================================================

importance_df.to_csv(
    OUTPUT_IMPORTANCE,
    index=False
)


# ============================================================
# SHAP SUMMARY PLOT
# ============================================================

print("\nGenerating SHAP summary plot...")


plt.figure()

shap.summary_plot(
    shap_values,
    X_sample,
    show=False
)

plt.tight_layout()

plt.savefig(
    OUTPUT_PLOT,
    dpi=200,
    bbox_inches="tight"
)

plt.close()


# ============================================================
# SHAP BAR PLOT
# ============================================================

print(
    "Generating SHAP importance bar plot..."
)


plt.figure()

shap.summary_plot(
    shap_values,
    X_sample,
    plot_type="bar",
    show=False
)

plt.tight_layout()

plt.savefig(
    OUTPUT_BAR,
    dpi=200,
    bbox_inches="tight"
)

plt.close()


# ============================================================
# COMPLETE
# ============================================================

print("\n")
print("=" * 65)
print("SHAP ANALYSIS COMPLETE")
print("=" * 65)


print("\nSaved:")

print(
    OUTPUT_IMPORTANCE
)

print(
    OUTPUT_PLOT
)

print(
    OUTPUT_BAR
)

print("\nDONE!")