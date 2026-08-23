from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Query, Request
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Literal
import pandas as pd
from pathlib import Path

from backend.app.schemas.telemetry import TelemetryIngestPayload, TelemetryResponse
from backend.app.models.telemetry import TelemetryRecord
from backend.app.db.session import get_db
from ml.inference import WaterSafetyPredictor
from backend.app.services.alert_dispatcher import AlertDispatcher
from backend.app.core.config import settings
from backend.app.core.security import get_admin_user
from backend.app.core.rate_limit import limiter

router = APIRouter(tags=["Telemetry & AI"])
predictor = WaterSafetyPredictor()
alert_manager = AlertDispatcher()

@router.post("/ingest", response_model=TelemetryResponse)
@limiter.limit("60/minute")
def ingest_telemetry(
    request: Request,
    payload: TelemetryIngestPayload, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    admin: bool = Depends(get_admin_user)
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
def get_latest_telemetry(node_id: str = "JalDrishiti-001", db: Session = Depends(get_db)):
    record = (
        db.query(TelemetryRecord)
        .filter(TelemetryRecord.node_id == node_id)
        .order_by(TelemetryRecord.timestamp.desc())
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="No telemetry records found.")
    return record

@router.get("/history")
def get_telemetry_history(
    node_id: str = "JalDrishiti-001",
    limit: int = Query(200, le=2000),
    source: Literal["live", "parquet", "hybrid"] = "hybrid",
    db: Session = Depends(get_db)
):
    live_records = []
    if source in ["live", "hybrid"]:
        live_records = db.query(TelemetryRecord).filter(TelemetryRecord.node_id == node_id).order_by(TelemetryRecord.timestamp.desc()).limit(limit).all()
        # Ensure we return them in ascending order of timestamp or descending based on original logic
        # Original logic returned them in [::-1] (ascending).
    
    parquet_records = []
    if source in ["parquet", "hybrid"]:
        try:
            parquet_path = Path(__file__).resolve().parent.parent.parent.parent / "ml" / "data" / "nirvaah_features.parquet"
            if parquet_path.exists():
                df = pd.read_parquet(parquet_path)
                # Just take the last 'limit' rows as mock history
                df_subset = df.tail(limit).to_dict(orient="records")
                for row in df_subset:
                    parquet_records.append({
                        "node_id": node_id,
                        "timestamp": row.get("time", datetime.utcnow()),
                        "latitude": row.get("latitude", 16.27),
                        "longitude": row.get("longitude", 73.71),
                        "ph": 7.0, # default since not in parquet
                        "turbidity_ntu": 5.0,
                        "ec_us_cm": 400.0,
                        "temperature_c": 25.0,
                        "particle_count": 50,
                        "avg_particle_size_mm": 0.5,
                        "predicted_safety_level": "UNKNOWN",
                        "confidence_pct": 0.0,
                        "safety_score": 50,
                        "alert_sent": False
                    })
        except Exception as e:
            print(f"Failed to read parquet history: {e}")

    # Combine based on source
    combined = []
    if source == "parquet":
        combined = parquet_records
    elif source == "live":
        combined = live_records
    else:
        # hybrid
        combined = parquet_records + live_records

    # Apply limit to combined and reverse if needed
    combined = combined[-limit:]
    
    # We can return as dicts or objects, FastAPI handles dicts fine for response_model if they match.
    return combined[::-1]

@router.get("/alerts", response_model=List[TelemetryResponse])
def get_alerts(db: Session = Depends(get_db)):
    records = db.query(TelemetryRecord).filter(TelemetryRecord.alert_sent == True).order_by(TelemetryRecord.timestamp.desc()).limit(500).yield_per(100).all()
    return records
