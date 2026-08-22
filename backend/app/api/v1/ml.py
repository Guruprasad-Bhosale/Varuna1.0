from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional
import pandas as pd
from pathlib import Path
from pydantic import BaseModel

from ml.inference import WaterSafetyPredictor

router = APIRouter(tags=["ML & Inference"])
predictor = WaterSafetyPredictor()

class PredictPayload(BaseModel):
    ph: float
    turbidity_ntu: float
    ec_us_cm: float
    temperature_c: float
    # Optional parameters (satellite / wave)
    chl: Optional[float] = None
    kd490: Optional[float] = None
    tsm: Optional[float] = None
    wave_height: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

@router.post("/predict")
def predict_risk(payload: PredictPayload):
    feature_dict = payload.model_dump(exclude_none=True)
    try:
        result = predictor.predict(feature_dict)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/hotspots")
def get_hotspots():
    try:
        # Load hotspot data
        parquet_path = Path(__file__).resolve().parent.parent.parent.parent / "ml" / "data" / "nirvaah_final_hotspots.parquet"
        if not parquet_path.exists():
            return {"hotspots": []}
            
        df = pd.read_parquet(parquet_path)
        # Convert to records
        return {"hotspots": df.to_dict(orient="records")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
