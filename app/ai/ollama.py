# app/ai/ollama.py

import requests

OLLAMA_URL = "http://localhost:11434/api/generate"


def generate_reasoning(patient, score, label, summary):
    prompt = f"""
You are an emergency triage doctor.

Patient Summary:
{summary}

Patient Complaint:
"{patient.get('verbal_problem', 'Not provided')}"

Urgency Score: {score}/10 -> {label}

Write EXACTLY 5 short bullet points explaining the medical reasoning.
Each bullet must be ONE complete sentence, under 15 words.
Do NOT write any introduction or conclusion.
"""

    try:
        res = requests.post(OLLAMA_URL, json={
            "model": "llama3",
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.1,
                "num_predict": 140
            }
        }, timeout=3)
        if res.status_code == 200:
            return res.json().get("response", "Clinical rationale generated based on vital signs.")
    except Exception as e:
        print(f"[Ollama] Connection error ({e}). Using rule-based clinical rationale fallback.")

    return (
        f"• Patient assessed with urgency score {score}/10 ({label}).\n"
        f"• Vital signs evaluation: {summary}.\n"
        f"• Reported complaint: {patient.get('verbal_problem', 'Not provided')}.\n"
        f"• High risk clinical indicators detected requiring medical prioritization.\n"
        f"• Priority tier assigned for safe emergency care delivery."
    )

