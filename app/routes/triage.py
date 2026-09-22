# app/routes/triage.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.ai_pipeline import run_triage_pipeline
from app.websocket import manager
from app.db.database import get_db
from app.db.crud import (
    create_patient,
    create_triage_result,
    create_audit_log
)

router = APIRouter()   # 🔥 THIS LINE WAS MISSING


@router.post("/triage")
async def triage_patient(patient_data: dict, db: Session = Depends(get_db)):

    # 1️⃣ Run AI Pipeline
    result = run_triage_pipeline(patient_data)

    # 2️⃣ Save Patient
    patient_record = create_patient(db, patient_data)

    # 3️⃣ Save Triage Result
    create_triage_result(db, patient_record.id, result)

    # 4️⃣ Audit Log
    create_audit_log(
        db,
        event_type="AI_TRIAGE",
        description=f"Triage executed for patient ID {patient_record.id}"
    )

    # 5️⃣ Live Dashboard Push
    await manager.broadcast({
        "patient": patient_data,
        **result
    })

    return {
        "status": "success",
        "data": result
    }
