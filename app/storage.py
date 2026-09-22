BATCH_SIZE = 10

patients_buffer = []
emergency_buffer = []


def add_patient(record):
    if record.get("patient", {}).get("emergency"):
        print("EMERGENCY PATIENT ADDED")
        emergency_buffer.append(record)
    else:
        print("NORMAL PATIENT ADDED")
        patients_buffer.append(record)


# ---------------- NORMAL QUEUE ----------------

def get_batches():
    """
    Returns normal patient batches sorted by urgency.
    """
    sorted_patients = sorted(
        patients_buffer,
        key=lambda x: x["urgency_score"],
        reverse=True
    )

    batches = [
        sorted_patients[i:i + BATCH_SIZE]
        for i in range(0, len(sorted_patients), BATCH_SIZE)
    ]

    return batches


def get_batch(batch_number: int = 1):
    """
    Fetch specific batch for doctor dashboard.
    """
    batches = get_batches()

    if batch_number <= 0 or batch_number > len(batches):
        return []

    return batches[batch_number - 1]


# ---------------- EMERGENCY QUEUE ----------------

def get_emergency_batches():
    """
    Returns emergency patient batches sorted by urgency.
    """
    sorted_patients = sorted(
        emergency_buffer,
        key=lambda x: x["urgency_score"],
        reverse=True
    )

    batches = [
        sorted_patients[i:i + BATCH_SIZE]
        for i in range(0, len(sorted_patients), BATCH_SIZE)
    ]

    return batches


def get_emergency_batch(batch_number: int = 1):
    """
    Fetch specific emergency batch for doctor dashboard.
    """
    batches = get_emergency_batches()

    if batch_number <= 0 or batch_number > len(batches):
        return []

    return batches[batch_number - 1]
