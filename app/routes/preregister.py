from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.prereg_db import PreRegistration, get_prereg_db
from app.schemas.preregister import PreRegisterSchema

router = APIRouter()


@router.post("/preregister")
def preregister_patient(
    data: PreRegisterSchema,
    db: Session = Depends(get_prereg_db)
):
    record = PreRegistration(**data.dict())
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "status": "success",
        "message": "Pre-registration completed",
        "id": record.id
    }


@router.get("/preregister/{patient_name}")
def fetch_preregistered_patient(
    patient_name: str,
    db: Session = Depends(get_prereg_db)
):
    record = (
        db.query(PreRegistration)
        .filter(PreRegistration.patient_name.ilike(patient_name))
        .order_by(PreRegistration.created_at.desc())
        .first()
    )

    if not record:
        raise HTTPException(status_code=404, detail="No pre-registration found")

    return {
        "hospital_name": record.hospital_name,
        "patient_name": record.patient_name,
        "age": record.age,
        "problem": record.problem,
        "email": record.email
    }


@router.get("/preregister/search/{query}")
def search_preregistered_patients(query: str, db: Session = Depends(get_prereg_db)):

    results = (
        db.query(PreRegistration)
        .filter(PreRegistration.patient_name.ilike(f"%{query}%"))
        .limit(10)
        .all()
    )

    return [
        {
            "id": r.id,
            "patient_name": r.patient_name,
            "age": r.age,
            "problem": r.problem,
            "email": r.email
        }
        for r in results
    ]
