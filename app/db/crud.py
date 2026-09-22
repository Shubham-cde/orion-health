# app/db/crud.py
from sqlalchemy.orm import Session
from app.db import models


# ------------------ PATIENT ------------------

def create_patient(db: Session, data: dict):
    patient = models.Patient(**data)
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


# ------------------ TRIAGE RESULT ------------------

def create_triage_result(db: Session, patient_id: int, triage_data: dict):
    triage = models.TriageResult(
        patient_id=patient_id,
        urgency_score=triage_data["urgency_score"],
        urgency_level=triage_data["urgency_level"],
        clinical_summary=triage_data["clinical_summary"],
        explanation=triage_data["explanation"]
    )
    db.add(triage)
    db.commit()
    db.refresh(triage)
    return triage


# ------------------ DOCTOR OVERRIDE ------------------

def create_doctor_action(db, triage_result_id, new_score, notes=None):
    action = models.DoctorAction(
        triage_result_id=triage_result_id,
        new_score=new_score,
        notes=notes
    )
    db.add(action)
    db.commit()
    db.refresh(action)
    return action


# ------------------ AUDIT LOG ------------------

def create_audit_log(db: Session, event_type: str, description: str):
    log = models.AuditLog(
        event_type=event_type,
        description=description
    )
    db.add(log)
    db.commit()
    return log
