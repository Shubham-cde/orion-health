"""
Email alerts for ORION-Health.

Two ways to send, chosen automatically:

1. Brevo HTTP API (set BREVO_API_KEY) - works everywhere, including free hosting
   platforms that block SMTP ports.
2. Gmail SMTP (set EMAIL_PASSWORD with a Gmail App Password) - fine for local use.

If neither is configured, emails are skipped and the app keeps working.
"""

import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import requests
from dotenv import load_dotenv

load_dotenv()

# Sender identity (used by both methods)
EMAIL_SENDER = os.getenv("EMAIL_SENDER")
EMAIL_SENDER_NAME = os.getenv("EMAIL_SENDER_NAME", "ORION-Health")

# Option 1: Brevo HTTP API
BREVO_API_KEY = os.getenv("BREVO_API_KEY")
BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"

# Option 2: SMTP
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")   # Gmail App Password
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))


def _send_via_brevo(subject, body, receiver_email):
    response = requests.post(
        BREVO_API_URL,
        headers={
            "accept": "application/json",
            "content-type": "application/json",
            "api-key": BREVO_API_KEY,
        },
        json={
            "sender": {"name": EMAIL_SENDER_NAME, "email": EMAIL_SENDER},
            "to": [{"email": receiver_email}],
            "subject": subject,
            "textContent": body,
        },
        timeout=10,
    )

    if response.status_code in (200, 201):
        return True

    print(f"❌ Brevo rejected the email ({response.status_code}): {response.text}")
    return False


def _send_via_smtp(subject, body, receiver_email):
    msg = MIMEMultipart()
    msg["From"] = EMAIL_SENDER
    msg["To"] = receiver_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=15)
    server.starttls()
    server.login(EMAIL_SENDER, EMAIL_PASSWORD)
    server.send_message(msg)
    server.quit()
    return True


def send_email(subject, body, receiver_email, label="Email"):
    """Send one email using whichever method is configured."""
    if not receiver_email:
        return False

    if not EMAIL_SENDER:
        print("⚠️ EMAIL_SENDER missing in .env. Skipping email.")
        return False

    try:
        if BREVO_API_KEY:
            sent = _send_via_brevo(subject, body, receiver_email)
        elif EMAIL_PASSWORD:
            sent = _send_via_smtp(subject, body, receiver_email)
        else:
            print("⚠️ No BREVO_API_KEY or EMAIL_PASSWORD in .env. Skipping email.")
            return False
    except Exception as e:
        print(f"❌ {label} failed: {e}")
        return False

    if sent:
        print(f"📧 {label} sent successfully to {receiver_email}")
    return sent


# ---------------- DOCTOR EMERGENCY ALERT ----------------

def send_emergency_alert(patient, score, label, summary, receiver_email):

    subject = "🚨 CRITICAL EMERGENCY ALERT"

    body = f"""
CRITICAL TRIAGE ALERT

Patient: {patient.get('name', 'Patient')}

Urgency Score: {score}/10
Status: {label}

Clinical Summary:
{summary}

Immediate medical attention is required.
"""

    return send_email(subject, body, receiver_email, label="Emergency email alert")


# ---------------- PATIENT NOTIFICATION ----------------

def send_patient_notification(patient, score, label, summary, receiver_email):

    subject = "ORION Health — Medical Status Update"

    if score >= 9:
        advice = "This is a medical emergency. Please go to the nearest emergency department immediately."
    elif score >= 7:
        advice = "Your condition requires urgent medical attention. Please visit the hospital as soon as possible."
    elif score >= 5:
        advice = "Your symptoms require a doctor's consultation. Please schedule a visit."
    else:
        advice = "Your symptoms appear mild. Rest and home care are advised."

    body = f"""
Dear {patient.get('name', 'Patient')},

Here is your medical status update:

Urgency Score: {score}/10
Status: {label}

Clinical Summary:
{summary}

Medical Advice:
{advice}

⚠️ This is an AI-assisted triage result and does not replace professional medical advice.

ORION-Health Team
"""

    return send_email(subject, body, receiver_email, label="Patient email notification")
