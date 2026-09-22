

def observe_patient(data):

    def safe(value, default):
        return default if value is None else value

    patient_name = data.get("name") or "Patient"

    features = {
        "pain_score": safe(data.get("pain_score"), 0),
        "duration_hours": safe(data.get("duration_hours"), 0),
        "age": safe(data.get("age"), 30),        # default adult age
        "spo2": safe(data.get("spo2"), 98),
        "temperature": safe(data.get("temperature"), 36.5),
        "chronic_disease": int(safe(data.get("chronic_disease"), 0)),
        "red_flag": int(safe(data.get("red_flag"), 0)),
    }

    summary = (
        f"{patient_name}, age {features['age']} years, "
        f"pain score {features['pain_score']}/10 for "
        f"{features['duration_hours']} hours, "
        f"SpO2 {features['spo2']}%, "
        f"temperature {features['temperature']}°C, "
        f"chronic disease {features['chronic_disease']}, "
        f"red flags {features['red_flag']}."
    )

    return features, summary, patient_name
