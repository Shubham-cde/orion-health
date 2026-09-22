# app/routes/doctor.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.agents.learner import process_override
from app.db import models
from app.db.crud import create_audit_log, create_doctor_action
from app.db.database import get_db
from app.db.learning_db import get_learning_db
from app.db.models import DoctorAction, Patient, TriageResult
from app.storage import get_batch, get_emergency_batch
from app.websocket import manager

router = APIRouter()


# ---------------------------------------------------
# 1. FETCH PRIORITIZED PATIENTS (BATCH-WISE)
# ---------------------------------------------------

@router.get("/doctor/patients")
def get_patients(batch: int = Query(1, ge=1)):
    """
    Fetch patients batch-wise (10 per batch).
    """
    return {
        "batch": batch,
        "patients": get_batch(batch)
    }


@router.get("/doctor/emergency")
def get_emergency_patients(batch: int = Query(1, ge=1)):
    """
    Fetch emergency patients batch-wise (10 per batch).
    """
    return {
        "batch": batch,
        "patients": get_emergency_batch(batch)
    }


# ---------------------------------------------------
# 2. DOCTOR OVERRIDE -> LEARNER AGENT PIPELINE
# ---------------------------------------------------

@router.post("/doctor/override")
async def override_ai_decision(
    payload: dict,
    db: Session = Depends(get_db),
    ldb: Session = Depends(get_learning_db)
):
    patient_id = payload["patient_id"]
    new_score = payload["new_score"]
    ai_score = payload["ai_score"]
    features = payload["features"]
    doctor_notes = payload.get("doctor_notes", "")

    # Get latest triage result for this patient
    latest_triage = (
        db.query(models.TriageResult)
        .filter(models.TriageResult.patient_id == patient_id)
        .order_by(models.TriageResult.created_at.desc())
        .first()
    )

    if not latest_triage:
        raise HTTPException(status_code=404, detail="No triage record found for this patient")

    # Save doctor override
    create_doctor_action(
        db,
        triage_result_id=latest_triage.id,
        new_score=new_score,
        notes=doctor_notes
    )

    # Continuous Learning Trigger
    process_override(
        features,
        ai_score,
        new_score,
        ldb
    )

    # Audit Log
    create_audit_log(
        db,
        event_type="DOCTOR_OVERRIDE",
        description=f"Doctor override for patient {patient_id}"
    )

    # WebSocket push
    await manager.broadcast({
        "event": "OVERRIDE",
        "patient_id": patient_id,
        "new_score": new_score
    })

    return {
        "status": "success",
        "message": "Override recorded and learning updated"
    }


@router.get("/doctor/history")
def doctor_history(db: Session = Depends(get_db)):
    """
    Doctor activity history + performance analytics
    """

    total_patients = db.query(TriageResult).count()

    emergency_cases = (
        db.query(TriageResult)
        .filter(TriageResult.urgency_score >= 9)
        .count()
    )

    total_overrides = db.query(DoctorAction).count()

    timeline = (
        db.query(
            Patient.name,
            TriageResult.urgency_score,
            TriageResult.created_at
        )
        .join(TriageResult, Patient.id == TriageResult.patient_id)
        .order_by(TriageResult.created_at.desc())
        .limit(50)
        .all()
    )

    formatted = [
        {
            "patient_name": t.name,
            "emergency": t.urgency_score >= 9,
            "date": t.created_at.date().isoformat(),
            "time": t.created_at.time().strftime("%H:%M")
        }
        for t in timeline
    ]

    return {
        "total_patients": total_patients,
        "emergency_cases": emergency_cases,
        "total_overrides": total_overrides,
        "timeline": formatted
    }
