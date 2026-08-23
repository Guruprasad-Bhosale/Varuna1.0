import logging
import sys
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uuid
import traceback
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

# Ensure backend can import relative modules from root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app.api.v1 import telemetry, ml
from backend.app.db.session import engine, Base
from sqlalchemy import text
from ml.inference import WaterSafetyPredictor
from backend.app.core.rate_limit import limiter
from backend.app.core.config import settings
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
    lifespan=lifespan,
    docs_url=None if settings.ENVIRONMENT == "production" else "/docs",
    redoc_url=None if settings.ENVIRONMENT == "production" else "/redoc"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    req_id = str(uuid.uuid4())
    logger.error(f"Unhandled exception (Request ID: {req_id}): {exc}")
    # Log the full traceback internally, do not leak to client
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "request_id": req_id}
    )

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = "default-src 'self'; img-src 'self' data: https:; script-src 'self'; style-src 'self' 'unsafe-inline';"
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://varuna-portal.onrender.com",
        "https://varuna1-0.onrender.com",
        "http://localhost:4200"
    ],
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
