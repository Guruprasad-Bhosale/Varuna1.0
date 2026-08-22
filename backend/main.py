import logging
import sys
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure backend can import relative modules from root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app.api.v1 import telemetry, ml
from backend.app.db.session import engine, Base
from sqlalchemy import text
from ml.inference import WaterSafetyPredictor
import time

def get_memory_usage_mb() -> float:
    if sys.platform != "win32":
        import resource
        return round(resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024, 2)
    return 0.0

start_time = time.time()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database...")
    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS ix_telemetry_node_timestamp 
            ON telemetry_records (node_id, timestamp DESC);
        """))
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS ix_telemetry_alert_timestamp 
            ON telemetry_records (alert_sent, timestamp DESC);
        """))
        conn.commit()
    logger.info("Database initialized successfully.")
    
    logger.info("Pre-warming ML model...")
    predictor = WaterSafetyPredictor()
    predictor.predict({
        "ph": 7.2, 
        "turbidity_ntu": 5.0, 
        "ec_us_cm": 450.0, 
        "temperature_c": 25.0,
        "particle_count": 50,
        "avg_particle_size_mm": 0.5,
        "chl": 1.85,
        "kd490": 0.12,
        "tsm": 4.50,
        "wave_height": 1.20
    })
    
    yield
    logger.info("Shutting down gracefully.")

app = FastAPI(
    title="Project VARUNA API",
    description="Backend for environmental IoT water quality platform",
    version="0.2.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.onrender\.com|http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(telemetry.router, prefix="/api/v1/telemetry", tags=["telemetry"])
app.include_router(ml.router, prefix="/api/v1/ml", tags=["ml"])

@app.get("/")
def read_root():
    return {"status": "ok", "message": "VARUNA API running"}

@app.get("/api/v1/health")
def health_check():
    db_latency_ms = None
    try:
        t0 = time.perf_counter()
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_latency_ms = round((time.perf_counter() - t0) * 1000, 2)
        db_status = "connected"
    except Exception as e:
        db_status = f"disconnected: {e}"
        
    predictor = WaterSafetyPredictor()
    ml_status = "heuristic_fallback" if getattr(predictor, "is_heuristic_fallback", False) else "scikit-learn"
    
    return {
        "status": "healthy" if db_status == "connected" else "unhealthy",
        "database": db_status,
        "db_latency_ms": db_latency_ms,
        "uptime_seconds": round(time.time() - start_time, 2),
        "memory_rss_mb": get_memory_usage_mb(),
        "ml_engine": ml_status
    }
