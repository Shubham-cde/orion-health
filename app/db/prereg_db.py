import os
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime

db_dir = os.environ.get("DB_DIR", ".")
DATABASE_URL = f"sqlite:///{db_dir}/pre_registration.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class PreRegistration(Base):
    __tablename__ = "pre_registrations"

    id = Column(Integer, primary_key=True, index=True)

    hospital_name = Column(String, nullable=True)
    patient_name = Column(String, index=True)
    age = Column(Integer)
    problem = Column(String)
    email = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)


Base.metadata.create_all(bind=engine)


def get_prereg_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
