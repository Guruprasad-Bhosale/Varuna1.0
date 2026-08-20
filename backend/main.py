import logging
import sys
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure backend can import relative modules from root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app.api.v1 import telemetry
from backend.app.db.session import engine, Base
from sqlalchemy import text

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

@app.get("/")
def read_root():
    return {"status": "ok", "message": "VARUNA API running"}

@app.get("/api/v1/health")
def health_check():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}
