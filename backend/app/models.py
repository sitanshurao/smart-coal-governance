# backend/app/models.py
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from app.database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    role = Column(String)
    phone = Column(String, unique=True, index=True)
    assigned_mine = Column(String)

class Inspection(Base):
    __tablename__ = "inspections"
    id = Column(Integer, primary_key=True, index=True)
    inspector_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    hazard_category = Column(String)
    location_zone = Column(String)           # NEW FIELD FOR AI
    days_since_last_check = Column(Integer)  # NEW FIELD FOR AI
    severity = Column(String)                # POPULATED BY AI
    description = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    is_resolved = Column(Boolean, default=False)