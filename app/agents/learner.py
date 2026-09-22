
import numpy as np
import joblib

# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from app.db.learning_db import LearningFeedback


OVERRIDE_THRESHOLD = 300
MODEL_PATH = "app/ai/learner_correction.pkl"



MIN_DELTA = 0.5    
MAX_DELTA = 4.0   


def process_override(
    features: dict,
    ai_score: float,
    doctor_score: float,
    db: Session,
    confidence: float = 1.0
):
    """
    Learner Agent - Safe Clinical Learning

    Learns ONLY from validated doctor overrides.
    Implements strict filtering to prevent noisy learning.
    """

    delta = doctor_score - ai_score

    

   
    if abs(delta) < MIN_DELTA:
        print("Learner: Ignored tiny correction:", delta)
        return

    
    if abs(delta) > MAX_DELTA:
        print("Learner: Ignored extreme correction:", delta)
        return

   
    if confidence < 0.7:
        print("Learner: Ignored low-confidence override")
        return

    

    record = LearningFeedback(
        features=features,
        ai_score=ai_score,
        doctor_score=doctor_score,
        delta=delta
    )
    db.add(record)
    db.commit()

    print("Learner: Stored validated learning sample")

    count = db.query(LearningFeedback).count()

    if count >= OVERRIDE_THRESHOLD:
        train_correction_model(db)


# ---------------- TRAIN CORRECTION MODEL ----------------

def train_correction_model(db: Session):
    records = db.query(LearningFeedback).all()

    if len(records) < OVERRIDE_THRESHOLD:
        print("Learner: Not enough data to train")
        return

    X, y = [], []

    for r in records:
        X.append(list(r.features.values()))
        y.append(r.delta)

    X = np.array(X)
    y = np.array(y)

    from sklearn.ensemble import GradientBoostingRegressor

    model = GradientBoostingRegressor(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=3,
        random_state=42
    )

    model.fit(X, y)

    joblib.dump(model, MODEL_PATH)

    print(f"Learner Agent: Correction model trained successfully with {len(records)} samples!")


# ---------------- PREDICT SAFE ADJUSTMENT ----------------

def predict_adjustment(features: dict) -> float:
    """
    Returns small safe correction to planner score.
    """
    try:
        model = joblib.load(MODEL_PATH)
        X = np.array([list(features.values())])
        adjustment = float(model.predict(X)[0])

        # Safety clamp - never allow large auto corrections
        adjustment = float(np.clip(adjustment, -2.0, 2.0))

        return adjustment

    except Exception:
        return 0.0
