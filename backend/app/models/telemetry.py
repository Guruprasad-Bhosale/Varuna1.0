from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from datetime import datetime
from backend.app.db.session import Base

class TelemetryRecord(Base):
    __tablename__ = "telemetry_records"

    id = Column(Integer, primary_key=True, index=True)
    node_id = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    latitude = Column(Float)
    longitude = Column(Float)
    
    ph = Column(Float)
    turbidity_ntu = Column(Float)
    ec_us_cm = Column(Float)
    temperature_c = Column(Float)
    particle_count = Column(Integer)
    avg_particle_size_mm = Column(Float)
    
    predicted_safety_level = Column(String, index=True)
    confidence_pct = Column(Float)
    safety_score = Column(Float)
    alert_sent = Column(Boolean, default=False)
