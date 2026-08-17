import os
import sys
import time
import logging
import requests
from datetime import datetime

# Optional: Using APScheduler if available, else falling back to a simple loop for standard Python
try:
    from apscheduler.schedulers.background import BackgroundScheduler
    HAS_SCHEDULER = True
except ImportError:
    HAS_SCHEDULER = False

# Ensure root modules can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from edge.camera import OpticalParticleScreener
from edge.serial_reader import SerialReader
from edge.local_db import LocalBufferDB

# Try to use ML Predictor if available on edge (Edge AI)
try:
    from ml.inference import WaterSafetyPredictor
    predictor = WaterSafetyPredictor()
    EDGE_AI_ENABLED = True
except Exception as e:
    EDGE_AI_ENABLED = False

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("VARUNA-MASTER")

HW_MODE = os.getenv("HW_MODE", "false").lower() == "true"
API_URL = os.getenv("API_URL", "http://localhost:8000/api/v1/telemetry/ingest")
NODE_ID = os.getenv("NODE_ID", "VARUNA-001")
LATITUDE = 16.142
LONGITUDE = 73.528

class EdgeOrchestrator:
    def __init__(self):
        self.screener = OpticalParticleScreener(hw_mode=HW_MODE)
        self.serial = SerialReader(hw_mode=HW_MODE)
        self.db = LocalBufferDB()
        if HAS_SCHEDULER:
            self.scheduler = BackgroundScheduler()
        else:
            self.scheduler = None
            
        self._last_sync_time = 0
        self._last_sample_time = 0
        
    def perform_sampling_cycle(self):
        logger.info("=== STARTING AUTONOMOUS SAMPLING CYCLE ===")
        
        # 1. Collect from ESP32 UART
        logger.info("Awaiting telemetry from ESP32 sensors...")
        sensor_data = self.serial.read_latest()
        
        if not sensor_data:
            logger.error("Failed to read sensors from ESP32. Cycle aborted.")
            return
            
        # 2. Optical Screen
        logger.info("Triggering Optical Particle Screener (OpenCV)...")
        cv_data, preview_path = self.screener.capture_and_analyze()
        
        # 3. Assemble complete feature vector
        payload = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "node_id": NODE_ID,
            "latitude": LATITUDE,
            "longitude": LONGITUDE,
            "ph": sensor_data.get("ph", 7.0),
            "turbidity_ntu": sensor_data.get("turbidity_ntu", 0.0),
            "ec_us_cm": sensor_data.get("ec_us_cm", 0.0),
            "temperature_c": sensor_data.get("temperature_c", 25.0),
            "particle_count": cv_data["particle_count"],
            "avg_particle_size_mm": cv_data["avg_particle_size_mm"]
        }
        
        # 4. Optional Edge AI pre-classification for immediate local response
        if EDGE_AI_ENABLED:
            try:
                inf = predictor.predict(payload)
                logger.info(f"Edge AI Preliminary Result: {inf['prediction']} (Score: {inf['safety_score']})")
            except Exception as e:
                logger.warning(f"Edge AI Inference failed: {e}")
            
        # 5. Store in local buffer queue
        self.db.enqueue(payload)
        
        # Trigger immediate sync attempt
        self.sync_to_cloud()
        logger.info("=== SAMPLING CYCLE COMPLETE ===")

    def sync_to_cloud(self):
        """Background worker to flush SQLite buffer to cloud."""
        queue_size = self.db.get_queue_size()
        if queue_size == 0:
            return
            
        logger.info(f"Attempting to sync {queue_size} pending records to cloud...")
        
        batch = self.db.pop_batch(batch_size=20)
        success_ids = []
        
        for row_id, payload in batch:
            try:
                response = requests.post(API_URL, json=payload, timeout=5)
                if response.status_code in (200, 201):
                    success_ids.append(row_id)
                else:
                    logger.warning(f"Cloud rejected payload ID {row_id} with status {response.status_code}")
                    break # Stop batch on error to preserve order
            except requests.exceptions.RequestException as e:
                logger.warning(f"Network offline during sync attempt. Retrying later. Error: {e}")
                break # Network down, stop trying
                
        if success_ids:
            self.db.remove_records(success_ids)
            logger.info(f"Successfully synced {len(success_ids)} records.")

    def start(self):
        logger.info(f"Starting Edge Master Orchestrator | HW_MODE: {HW_MODE}")
        
        if self.scheduler:
            # Add scheduled jobs (e.g., every 20 minutes in prod, every 1 min here for testing)
            self.scheduler.add_job(self.perform_sampling_cycle, 'interval', minutes=1)
            self.scheduler.add_job(self.sync_to_cloud, 'interval', minutes=5)
            self.scheduler.start()
            
            try:
                self.perform_sampling_cycle() # Initial run
                while True:
                    time.sleep(1)
            except (KeyboardInterrupt, SystemExit):
                self.scheduler.shutdown()
                logger.info("Edge Orchestrator shutting down.")
        else:
            logger.info("APScheduler not found. Running simple async loop.")
            # Fallback manual loop
            try:
                while True:
                    now = time.time()
                    if now - self._last_sample_time >= 60: # 1 minute sampling
                        self.perform_sampling_cycle()
                        self._last_sample_time = now
                    
                    if now - self._last_sync_time >= 300: # 5 minute sync
                        self.sync_to_cloud()
                        self._last_sync_time = now
                        
                    time.sleep(1)
            except KeyboardInterrupt:
                logger.info("Edge Orchestrator shutting down.")

if __name__ == "__main__":
    orchestrator = EdgeOrchestrator()
    orchestrator.start()
