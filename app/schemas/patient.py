from typing import Optional

from pydantic import BaseModel, Field


class PatientSchema(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "Rahul Sharma"})
    pain_score: int
    duration_hours: int
    age: Optional[int] = None
    spo2: int
    temperature: float
    chronic_disease: int
    red_flag: int
    verbal_problem: Optional[str] = None
    email: Optional[str] = None
    doctor_email: Optional[str] = None
    emergency: Optional[bool] = False
