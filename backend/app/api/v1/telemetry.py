from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from backend.app.schemas.telemetry import TelemetryIngestPayload, TelemetryResponse
from backend.app.models.telemetry import TelemetryRecord
from backend.app.db.session import get_db
from ml.inference import WaterSafetyPredictor
from backend.app.services.alert_dispatcher import AlertDispatcher
from backend.app.core.config import settings

router = APIRouter(tags=["Telemetry & AI"])
predictor = WaterSafetyPredictor()
alert_manager = AlertDispatcher()

@router.post("/ingest", response_model=TelemetryResponse)
def ingest_telemetry(
    payload: TelemetryIngestPayload, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    if not predictor:
        raise HTTPException(status_code=503, detail="ML inference engine not available")
        
    # 1. Run ML Inference
    feature_dict = {
        "ph": payload.ph,
        "turbidity_ntu": payload.turbidity_ntu,
        "ec_us_cm": payload.ec_us_cm,
        "temperature_c": payload.temperature_c,
        "particle_count": payload.particle_count,
        "avg_particle_size_mm": payload.avg_particle_size_mm
    }
    
    inf_result = predictor.predict(feature_dict)
    alert_triggered = inf_result["is_anomaly"]

    # 2. Persist Record to Database
    obs = TelemetryRecord(
        node_id=payload.node_id,
        timestamp=payload.timestamp or datetime.utcnow(),
        latitude=payload.latitude,
        longitude=payload.longitude,
        ph=payload.ph,
        turbidity_ntu=payload.turbidity_ntu,
        ec_us_cm=payload.ec_us_cm,
        temperature_c=payload.temperature_c,
        particle_count=payload.particle_count,
        avg_particle_size_mm=payload.avg_particle_size_mm,
        predicted_safety_level=inf_result["prediction"],
        confidence_pct=inf_result["confidence_pct"],
        safety_score=inf_result["safety_score"],
        alert_sent=alert_triggered
    )
    
    db.add(obs)
    db.commit()
    db.refresh(obs)

    # 4. Dispatch Asynchronous Alerts if safety is compromised
    if alert_triggered:
        # We add a fire-and-forget background task so ingestion API remains fast
        background_tasks.add_task(
            alert_manager.dispatch_critical_alerts,
            {
                "node_id": payload.node_id,
                "predicted_safety_level": inf_result["prediction"],
                "safety_score": inf_result["safety_score"],
                "confidence_pct": inf_result["confidence_pct"],
                "ph": payload.ph,
                "turbidity_ntu": payload.turbidity_ntu,
                "ec_us_cm": payload.ec_us_cm,
                "temperature_c": payload.temperature_c,
                "particle_count": payload.particle_count,
                "latitude": payload.latitude,
                "longitude": payload.longitude,
                "timestamp": str(payload.timestamp or datetime.utcnow())
            },
            settings
        )

    return obs

@router.get("/latest", response_model=TelemetryResponse)
def get_latest_telemetry(node_id: str = "VARUNA-001", db: Session = Depends(get_db)):
    record = (
        db.query(TelemetryRecord)
        .filter(TelemetryRecord.node_id == node_id)
        .order_by(TelemetryRecord.timestamp.desc())
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="No telemetry records found.")
    return record

@router.get("/history", response_model=List[TelemetryResponse])
def get_history(node_id: str = "VARUNA-001", limit: int = 500, db: Session = Depends(get_db)):
    limit = min(limit, 2000)
    records = db.query(TelemetryRecord).filter(TelemetryRecord.node_id == node_id).order_by(TelemetryRecord.timestamp.desc()).limit(limit).yield_per(100).all()
    return records[::-1]

@router.get("/alerts", response_model=List[TelemetryResponse])
def get_alerts(db: Session = Depends(get_db)):
    records = db.query(TelemetryRecord).filter(TelemetryRecord.alert_sent == True).order_by(TelemetryRecord.timestamp.desc()).limit(500).yield_per(100).all()
    return records
