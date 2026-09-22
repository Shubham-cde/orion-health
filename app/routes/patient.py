# app/routes/patient.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.ai_pipeline import run_triage_pipeline
from app.db.crud import create_audit_log, create_patient, create_triage_result
from app.db.database import get_db
from app.db.models import Patient, TriageResult
from app.db.prereg_db import PreRegistration, get_prereg_db
from app.schemas.patient import PatientSchema
from app.storage import add_patient
from app.websocket import manager

router = APIRouter()


# ---------------- PATIENT SUBMIT ----------------

@router.post("/patient/submit")
async def submit_patient(
    patient_data: PatientSchema,
    db: Session = Depends(get_db),
    pdb: Session = Depends(get_prereg_db)
):
    """
    Patient submits clinical data.
    Triggers AI triage pipeline, stores results,
    updates doctor dashboard, and logs actions.
    """

    # Convert Pydantic model to dict
    data = patient_data.dict()

    # AUTO-FETCH FROM PRE-REGISTRATION DB
    record = (
        pdb.query(PreRegistration)
        .filter(PreRegistration.patient_name.ilike(data["name"]))
        .order_by(PreRegistration.created_at.desc())
        .first()
    )

    if record:
        print("Auto-filling patient data from pre-registration DB")
        data["age"] = record.age

        if not data.get("verbal_problem"):
            data["verbal_problem"] = record.problem

        if not data.get("email"):
            data["email"] = record.email

    # Remove operational-only fields (not stored in Patient DB table)
    patient_email = data.pop("email", None)
    doctor_email = data.pop("doctor_email", None)
    emergency = data.pop("emergency", False)

    # Input for AI pipeline (includes emails for emergency & patient alerts)
    ai_input = {
        **data,
        "email": patient_email,
        "doctor_email": doctor_email,
        "emergency": emergency
    }

    # 1. Run AI Pipeline (Observer -> Planner -> Explainer -> Action)
    result = run_triage_pipeline(ai_input)

    # 2. Store Patient Medical Data
    patient = create_patient(db, data)

    # 3. Store AI Triage Result
    create_triage_result(db, patient.id, result)

    # 4. Store Audit Log
    create_audit_log(
        db,
        event_type="PATIENT_SUBMIT",
        description=f"Patient {patient.id} submitted data"
    )

    # 5. Push to Live Doctor Queue (in-memory priority list)
    add_patient({
        "patient": ai_input,
        **result
    })

    # 6. WebSocket Live Update to Doctor Dashboard
    await manager.broadcast({
        "patient": ai_input,
        **result
    })

    return {
        "status": "success",
        "triage_result": result
    }


@router.get("/patient/history/{name}")
def patient_history(name: str, db: Session = Depends(get_db)):
    """
    Complete visit history of a patient
    """

    patient = db.query(Patient).filter(Patient.name == name).first()

    if not patient:
        return {"error": "Patient not found"}

    visits = (
        db.query(TriageResult)
        .filter(TriageResult.patient_id == patient.id)
        .order_by(TriageResult.created_at.desc())
        .all()
    )

    timeline = [
        {
            "date": v.created_at.date().isoformat(),
            "time": v.created_at.time().strftime("%H:%M"),
            "urgency_score": v.urgency_score,
            "urgency_level": v.urgency_level,
            "emergency": v.urgency_score >= 9
        }
        for v in visits
    ]

    return {
        "name": patient.name,
        "age": patient.age,
        "total_visits": len(visits),
        "emergency_visits": sum(v["emergency"] for v in timeline),
        "timeline": timeline
    }
