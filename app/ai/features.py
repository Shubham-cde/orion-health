

def build_features(data):
    return {
        "pain_score": data["pain_score"],
        "duration_hours": data["duration_hours"],
        "age": data["age"],
        "spo2": data["spo2"],
        "temperature": data["temperature"],
        "chronic_disease": int(data["chronic_disease"]),
        "red_flag": int(data["red_flag"]),
    }
