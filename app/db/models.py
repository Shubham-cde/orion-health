# app/db/models.py
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.database import Base


# -------------------------
# PATIENT TABLE
# -------------------------

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=True)
    age = Column(Integer)
    spo2 = Column(Integer)
    temperature = Column(Float)
    pain_score = Column(Integer)
    duration_hours = Column(Integer)
    chronic_disease = Column(Integer)
    red_flag = Column(Integer)
    verbal_problem = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    triage_results = relationship(
        "TriageResult",
        back_populates="patient",
        cascade="all, delete"
    )


# -------------------------
# TRIAGE RESULT TABLE
# -------------------------

class TriageResult(Base):
    __tablename__ = "triage_results"

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(Integer, ForeignKey("patients.id"))

    urgency_score = Column(Float)
    urgency_level = Column(String)

    clinical_summary = Column(String)
    explanation = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="triage_results")

    doctor_actions = relationship(
        "DoctorAction",
        back_populates="triage_result",
        cascade="all, delete"
    )


# -------------------------
# DOCTOR ACTION TABLE
# -------------------------

class DoctorAction(Base):
    __tablename__ = "doctor_actions"

    id = Column(Integer, primary_key=True, index=True)

    triage_result_id = Column(Integer, ForeignKey("triage_results.id"))
    new_score = Column(Float)
    notes = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    triage_result = relationship("TriageResult", back_populates="doctor_actions")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(100))
    description = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)
