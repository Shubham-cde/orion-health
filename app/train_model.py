"""
Train the ORION-Health urgency scoring model.

The model is a scikit-learn GradientBoostingRegressor that predicts a
1-10 urgency score from the same 7 features the Observer Agent extracts:
pain_score, duration_hours, age, spo2, temperature (°C), chronic_disease, red_flag.

Training data is generated synthetically from clinical rules (no real patient data).

Run manually:   python app/train_model.py
The app also calls train_and_save() automatically on startup if the saved
model is missing or was created with a different scikit-learn version.
"""

import os

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split

FEATURES = [
    "pain_score",
    "duration_hours",
    "age",
    "spo2",
    "temperature",
    "chronic_disease",
    "red_flag",
]

DEFAULT_MODEL_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "ai", "urgency_score_model_boost.pkl"
)


def clinical_urgency(df):
    """Rule-based urgency label (1-10) used to create the synthetic training targets."""
    score = 1.0 + 0.45 * df["pain_score"]

    # Oxygen saturation
    score += np.select(
        [df["spo2"] < 85, df["spo2"] < 90, df["spo2"] < 94],
        [4.0, 3.0, 1.5],
        default=0.0,
    )

    # Temperature (°C)
    score += np.select(
        [df["temperature"] >= 40, df["temperature"] >= 39, df["temperature"] >= 38, df["temperature"] < 35.5],
        [2.0, 1.2, 0.6, 1.5],
        default=0.0,
    )

    score += 2.5 * df["red_flag"]
    score += 0.8 * df["chronic_disease"]

    # Age extremes are higher risk
    score += np.where((df["age"] >= 65) | (df["age"] < 5), 0.8, 0.0)

    # Sudden severe pain is more urgent than long-standing mild pain
    score += np.where((df["duration_hours"] <= 6) & (df["pain_score"] >= 7), 0.5, 0.0)

    return np.clip(score, 1, 10)


def generate_dataset(n=20000, seed=42):
    """Create a synthetic patient dataset with realistic value ranges."""
    rng = np.random.default_rng(seed)

    normal_spo2 = rng.integers(94, 101, n)
    low_spo2 = rng.integers(75, 94, n)
    spo2 = np.where(rng.random(n) < 0.8, normal_spo2, low_spo2)

    df = pd.DataFrame({
        "pain_score": rng.integers(0, 11, n),
        "duration_hours": rng.integers(0, 73, n),
        "age": rng.integers(1, 91, n),
        "spo2": spo2,
        "temperature": np.round(rng.normal(37.3, 1.1, n).clip(34.5, 41.5), 1),
        "chronic_disease": rng.integers(0, 2, n),
        "red_flag": (rng.random(n) < 0.2).astype(int),
    })

    noise = rng.normal(0, 0.4, n)
    df["urgency"] = np.clip(clinical_urgency(df) + noise, 1, 10)
    return df


def train_and_save(model_path=DEFAULT_MODEL_PATH):
    """Train the model on synthetic data, save it, and return it."""
    print("[train_model] Training urgency model on synthetic data...")
    df = generate_dataset()

    X_train, X_test, y_train, y_test = train_test_split(
        df[FEATURES], df["urgency"], test_size=0.2, random_state=42
    )

    model = GradientBoostingRegressor(
        n_estimators=150, max_depth=3, learning_rate=0.1, random_state=42
    )
    model.fit(X_train, y_train)

    mae = mean_absolute_error(y_test, model.predict(X_test))
    print(f"[train_model] Done. Mean absolute error on test set: {mae:.2f} points (out of 10)")

    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    joblib.dump(model, model_path)
    print(f"[train_model] Model saved to {model_path}")
    return model


if __name__ == "__main__":
    train_and_save()
