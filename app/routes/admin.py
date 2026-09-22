# app/routes/admin.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import AuditLog

router = APIRouter()


# ---------------- SYSTEM LOGS ----------------

@router.get("/admin/logs")
def get_logs(db: Session = Depends(get_db)):
    """
    Returns complete system audit logs.
    """
    return (
        db.query(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .all()
    )


# ---------------- SYSTEM HEALTH ----------------

@router.get("/admin/health")
def system_health():
    """
    System health monitoring endpoint.
    """
    return {
        "system": "ORION-Health",
        "backend": "running",
        "ai_pipeline": "active",
        "database": "connected",
        "websocket": "online"
    }
