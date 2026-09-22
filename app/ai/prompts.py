# app/ai/prompts.py


def triage_prompt(patient_data: dict, urgency: float) -> str:
    return f"""
You are a senior emergency department triage doctor.

Patient Details:
Age: {patient_data.get('age')}
Vital Signs: {patient_data.get('vital_signs')}
Symptoms: {patient_data.get('symptoms')}

Predicted Urgency Score: {urgency}/10

Explain clearly in 4-6 short medical bullet points why this urgency score was assigned.
Use simple clinical language suitable for doctors and nurses.
"""
