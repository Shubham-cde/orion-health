# app/main.py

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import engine
from app.db.models import Base
from app.routes.admin import router as admin_router
from app.routes.doctor import router as doctor_router
from app.routes.patient import router as patient_router
from app.routes.preregister import router as prereg_router
from app.routes.triage import router as triage_router
from app.websocket import manager

# CREATE FASTAPI APP
app = FastAPI(title="ORION-Health AI Triage Backend")

# CORS (Allow frontend + LAN + mobile)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# CREATE DATABASE TABLES
Base.metadata.create_all(bind=engine)

# REGISTER ROUTERS
app.include_router(prereg_router, prefix="/api", tags=["Pre-Registration"])
app.include_router(patient_router, prefix="/api", tags=["Patient"])
app.include_router(triage_router, prefix="/api", tags=["AI Triage"])
app.include_router(doctor_router, prefix="/api", tags=["Doctor"])
app.include_router(admin_router, prefix="/api", tags=["Admin"])


@app.get("/")
def root():
    return {"message": "ORION-Health Backend Running"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
