

import os
import warnings

import joblib
import numpy as np
import pandas as pd

try:
    from sklearn.exceptions import InconsistentVersionWarning
except ImportError:  # older scikit-learn
    InconsistentVersionWarning = UserWarning

MODEL_PATH = os.path.join(os.path.dirname(__file__), "urgency_score_model_boost.pkl")


def _load_or_train_model():
    """
    Load the saved model. If it's missing or was saved with a different
    scikit-learn version, retrain it on this machine so it always works.
    """
    if os.path.exists(MODEL_PATH):
        try:
            with warnings.catch_warnings():
                warnings.simplefilter("error", InconsistentVersionWarning)
                return joblib.load(MODEL_PATH)
        except Exception as e:
            print(f"[UrgencyScoringModel] Saved model can't be used here ({e}). Retraining...")

    try:
        from app.train_model import train_and_save
        return train_and_save(MODEL_PATH)
    except Exception as e:
        print(
            f"[UrgencyScoringModel] Model training failed ({e}), "
            "falling back to clinical rule-based scoring engine."
        )
        return None


class UrgencyScoringModel:
    def __init__(self):
        self.model = _load_or_train_model()

    def predict(self, features: dict):
        if self.model is not None:
            try:
                df = pd.DataFrame([features])
                raw_score = self.model.predict(df)[0]
                score = float(np.clip(raw_score, 1, 10))
                return round(score, 2)
            except Exception as e:
                print(f"[UrgencyScoringModel] Model prediction failed ({e}), using clinical fallback.")

        
        score = float(features.get("pain_score", 5)) * 0.4

        spo2 = features.get("spo2", 98)
        if spo2 < 90:
            score += 3.5
        elif spo2 < 95:
            score += 1.8

        hr = features.get("heart_rate", 75)
        if hr > 120 or hr < 45:
            score += 2.5
        elif hr > 100 or hr < 55:
            score += 1.2

        sys_bp = features.get("bp_sys", 120)
        if sys_bp > 160 or sys_bp < 90:
            score += 2.0
        elif sys_bp > 140:
            score += 1.0

        rr = features.get("respiratory_rate", 16)
        if rr > 28 or rr < 10:
            score += 2.0
        elif rr > 22:
            score += 1.0

        score = float(np.clip(score, 1, 10))
        return round(score, 2)

    def interpret(self, score):
        if score < 3:
            return "Low (Home Care)"
        elif score < 5:
            return "Mild (OPD)"
        elif score < 7:
            return "Moderate (Doctor Soon)"
        elif score < 9:
            return "High (Priority)"
        else:
            return "Critical (Emergency)"
