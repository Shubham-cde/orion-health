from app.automation.alerts import send_emergency_alert, send_patient_notification


def execute_actions(patient_data, triage_result):

    score = triage_result["urgency_score"]
    label = triage_result["urgency_level"]
    summary = triage_result["clinical_summary"]

    doctor_email = patient_data.get("doctor_email")
    patient_email = patient_data.get("email")

    # Doctor Emergency Alert: only for High / Critical cases (score >= 7) or the emergency flag
    if doctor_email and (score >= 7.0 or patient_data.get("emergency")):
        send_emergency_alert(patient_data, score, label, summary, doctor_email)

    # Patient Medical Status Update: whenever the patient gave an email
    if patient_email:
        send_patient_notification(patient_data, score, label, summary, patient_email)

    return True
