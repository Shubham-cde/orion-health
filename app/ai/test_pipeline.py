# app/ai/test_pipeline.py

from app.ai_pipeline import run_triage_pipeline

def test_run_triage_pipeline():
    sample = {
        "pain_score": 10,
        "duration_hours": 1,
        "age": 72,
        "spo2": 84,
        "temperature": 40.3,
        "chronic_disease": 1,
        "red_flag": 1,
        "verbal_problem": "Severe chest pain, unconsciousness, and breathing difficulty"
    }

    result = run_triage_pipeline(sample)

    assert "urgency_score" in result
    assert "urgency_level" in result
    assert "explanation" in result
    assert result["urgency_score"] >= 1.0

if __name__ == "__main__":
    test_run_triage_pipeline()

