# backend/app/schemas.py
from pydantic import BaseModel
from datetime import datetime

class InspectionBase(BaseModel):
    inspector_id: int
    hazard_category: str
    location_zone: str
    days_since_last_check: int
    description: str
    latitude: float
    longitude: float

# Incoming data no longer requires severity (AI predicts it)
class InspectionCreate(InspectionBase):
    pass

# Outgoing data will include the AI's severity prediction and DB metadata
class InspectionResponse(InspectionBase):
    id: int
    severity: str
    timestamp: datetime
    is_resolved: bool

    class Config:
        from_attributes = True