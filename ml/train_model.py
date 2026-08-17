import os
import json
import logging
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
import joblib

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("VARUNA-ML-TRAIN")

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "waterData.csv"
ARTIFACTS_DIR = BASE_DIR / "artifacts"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

FEATURES = [
    "ph",
    "turbidity_ntu",
    "ec_us_cm",
    "temperature_c",
    "particle_count",
    "avg_particle_size_mm"
]
TARGET = "safety_level"

def train():
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}")

    logger.info("Loading dataset from %s", DATA_PATH)
    df = pd.read_csv(DATA_PATH)

    X = df[FEATURES].copy()
    y = df[TARGET].copy()

    # Encoders & Scalers
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Train / Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )

    # Stratified K-Fold Cross Validation
    clf = RandomForestClassifier(
        n_estimators=150,
        max_depth=8,
        min_samples_split=3,
        random_state=42,
        class_weight="balanced"
    )

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(clf, X_scaled, y_encoded, cv=cv, scoring="accuracy")
    logger.info("5-Fold Cross Validation Accuracy: %.4f (+/- %.4f)", cv_scores.mean(), cv_scores.std())

    # Fit final model
    clf.fit(X_train, y_train)

    # Evaluation
    y_pred = clf.predict(X_test)
    report = classification_report(
        y_test, y_pred, target_names=label_encoder.classes_, output_dict=True
    )
    logger.info("Test Set Classification Report:\n%s", classification_report(y_test, y_pred, target_names=label_encoder.classes_))

    # Feature Importance
    importances = dict(zip(FEATURES, [round(x, 4) for x in clf.feature_importances_]))
    logger.info("Feature Importances: %s", importances)

    # Save Artifacts
    joblib.dump(clf, ARTIFACTS_DIR / "water_safety_rf.joblib")
    joblib.dump(scaler, ARTIFACTS_DIR / "scaler.joblib")
    joblib.dump(label_encoder, ARTIFACTS_DIR / "label_encoder.joblib")

    # Save Training Metadata
    metadata = {
        "features": FEATURES,
        "classes": label_encoder.classes_.tolist(),
        "cv_accuracy_mean": float(cv_scores.mean()),
        "feature_importances": importances,
        "test_metrics": report
    }
    with open(ARTIFACTS_DIR / "model_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    logger.info("All model artifacts successfully exported to %s", ARTIFACTS_DIR)

if __name__ == "__main__":
    train()
