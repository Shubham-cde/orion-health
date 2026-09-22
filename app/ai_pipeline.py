# app/ai_pipeline.py
from app.agents.explainer import explain_triage
from app.agents.observer import observe_patient
from app.agents.planner import plan_triage
from app.agents.action import execute_actions


def run_triage_pipeline(patient_data):

    # 1. Observer
    features, summary, patient_name = observe_patient(patient_data)

    # 2. Planner
    score, label = plan_triage(features)

    # 3. Explainer (identity + ML + reasoning)
    triage_result = explain_triage(
        patient_data,
        patient_name,
        summary,
        score,
        label
    )

    # 4. Action Agent
    execute_actions(patient_data, triage_result)

    return triage_result
