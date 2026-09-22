from typing import Optional

from pydantic import BaseModel


class PreRegisterSchema(BaseModel):
    hospital_name: Optional[str] = None
    patient_name: str
    age: int
    problem: str
    email: Optional[str] = None
