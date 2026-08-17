from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional

class TelemetryIngestPayload(BaseModel):
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow)
    node_id: str = Field(...)
    latitude: float = Field(...)
    longitude: float = Field(...)
    ph: float = Field(..., ge=0.0, le=14.0)
    turbidity_ntu: float = Field(..., ge=0.0)
    ec_us_cm: float = Field(..., ge=0.0)
    temperature_c: float = Field(...)
    particle_count: int = Field(..., ge=0)
    avg_particle_size_mm: float = Field(..., ge=0.0)

class TelemetryResponse(BaseModel):
    id: int
    node_id: str
    timestamp: datetime
    latitude: float
    longitude: float
    ph: float
    turbidity_ntu: float
    ec_us_cm: float
    temperature_c: float
    particle_count: int
    avg_particle_size_mm: float
    predicted_safety_level: str
    confidence_pct: float
    safety_score: float
    alert_sent: bool

    model_config = ConfigDict(from_attributes=True)
