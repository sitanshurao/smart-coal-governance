# backend/app/main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import joblib
import os
import warnings

from app import models, schemas
from app.database import engine, SessionLocal

warnings.filterwarnings("ignore", category=UserWarning)

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Coal Governance API - Production")

# Allow requests from localhost and public web hosts
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Robust model path resolution
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
ROOT_DIR = os.path.dirname(BACKEND_DIR)
MODEL_DIR = os.path.join(ROOT_DIR, "ai_engine", "saved_models")

# Fallback path if deployed directly from backend directory
if not os.path.exists(MODEL_DIR):
    MODEL_DIR = os.path.join(BACKEND_DIR, "saved_models")

try:
    risk_model = joblib.load(os.path.join(MODEL_DIR, "risk_model.pkl"))
    le_hazard = joblib.load(os.path.join(MODEL_DIR, "le_hazard.pkl"))
    le_zone = joblib.load(os.path.join(MODEL_DIR, "le_zone.pkl"))
    print("✅ AI Risk Engine Loaded Successfully")
except Exception as e:
    print(f"⚠️ AI Models not found at {MODEL_DIR}. Error: {e}")
    risk_model, le_hazard, le_zone = None, None, None

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"status": "Online", "system": "Smart Coal Governance Platform"}

@app.post("/inspections/", response_model=schemas.InspectionResponse)
def create_inspection(inspection: schemas.InspectionCreate, db: Session = Depends(get_db)):
    predicted_severity = "Medium"
    
    if risk_model and le_hazard and le_zone:
        try:
            haz_enc = le_hazard.transform([inspection.hazard_category])[0]
            zone_enc = le_zone.transform([inspection.location_zone])[0]
            pred = risk_model.predict([[haz_enc, zone_enc, inspection.days_since_last_check]])
            predicted_severity = str(pred[0])
        except Exception:
            predicted_severity = "High"

    db_inspection = models.Inspection(
        inspector_id=inspection.inspector_id,
        hazard_category=inspection.hazard_category,
        location_zone=inspection.location_zone,
        days_since_last_check=inspection.days_since_last_check,
        severity=predicted_severity,
        description=inspection.description,
        latitude=inspection.latitude,
        longitude=inspection.longitude
    )
    db.add(db_inspection)
    db.commit()
    db.refresh(db_inspection)
    return db_inspection

@app.get("/inspections/", response_model=List[schemas.InspectionResponse])
def get_inspections(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Inspection).offset(skip).limit(limit).all()

@app.patch("/inspections/{inspection_id}/resolve", response_model=schemas.InspectionResponse)
def resolve_inspection(inspection_id: int, db: Session = Depends(get_db)):
    record = db.query(models.Inspection).filter(models.Inspection.id == inspection_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Inspection not found")
    record.is_resolved = True
    db.commit()
    db.refresh(record)
    return record