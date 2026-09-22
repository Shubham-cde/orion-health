
from app.ai.ollama import generate_reasoning


def explain_triage(patient_data, patient_name, summary, score, label):
    """
    Explainer Agent:
    Combines patient identity, clinical summary,
    and ML urgency output to generate medical reasoning.
    """

    explanation = generate_reasoning(
        patient=patient_data,
        score=score,
        label=label,
        summary=f"Patient Name: {patient_name}\n{summary}"
    )

    return {
        "patient_name": patient_name,
        "urgency_score": score,
        "urgency_level": label,
        "clinical_summary": summary,
        "explanation": explanation
    }
