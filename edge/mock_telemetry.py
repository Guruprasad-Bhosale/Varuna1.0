import time
import json
import logging
import argparse
import random
import requests
from datetime import datetime
from enum import Enum
import sys
import os

# Dynamically add project root to path to import schemas
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
try:
    from backend.app.schemas.telemetry import TelemetryIngestPayload as TelemetryPayload
except ImportError:
    # Fallback if schemas not accessible
    logging.warning("Could not import TelemetryPayload from backend. Using raw dictionary.")
    TelemetryPayload = None


# Configure logging
logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s - %(message)s', datefmt='%H:%M:%S')
logger = logging.getLogger("EdgeEmulator")

class NodeState(Enum):
    IDLE = "IDLE"
    PUMPING = "PUMPING"
    STABILIZING = "STABILIZING"
    SENSOR_READ = "SENSOR_READ"
    OPTICAL_SCREEN = "OPTICAL_SCREEN"
    JSON_EMIT = "JSON_EMIT"
    DRAIN = "DRAIN"

class MockTelemetryEmulator:
    def __init__(self, node_id: str, interval: int, anomaly: str, export_json: bool):
        self.node_id = node_id
        self.interval = interval
        self.anomaly = anomaly
        self.export_json = export_json
        self.state = NodeState.IDLE
        self.current_reading = {}

    def transition_to(self, new_state: NodeState, delay_seconds: float = 1.0):
        logger.info(f"State Transition: {self.state.value} -> {new_state.value}")
        self.state = new_state
        time.sleep(delay_seconds)

    def simulate_readings(self):
        """Generate reading based on anomaly mode."""
        base_lat = 16.7050
        base_lon = 74.2433
        
        if self.anomaly == 'industrial_dump':
            ph = random.uniform(4.5, 5.5)
            ec = random.uniform(1500, 3000)
            turb = random.uniform(10, 50)
            p_count = int(random.uniform(100, 250))
            p_size = random.uniform(5.0, 10.0)
        elif self.anomaly == 'heavy_rain':
            ph = random.uniform(6.5, 7.5)
            ec = random.uniform(100, 250)
            turb = random.uniform(80, 200)
            p_count = int(random.uniform(200, 600))
            p_size = random.uniform(25.0, 45.0)
        elif self.anomaly == 'extreme_acidic':
            ph = random.uniform(2.0, 4.0)
            ec = random.uniform(2000, 4000)
            turb = random.uniform(5, 20)
            p_count = int(random.uniform(20, 80))
            p_size = random.uniform(5.0, 15.0)
        else: # normal
            ph = random.uniform(6.8, 8.2)
            ec = random.uniform(200, 500)
            turb = random.uniform(2, 10)
            p_count = int(random.uniform(10, 50))
            p_size = random.uniform(5.0, 12.0)
            
        temp = random.uniform(22.0, 28.0)
        
        return {
            "timestamp": datetime.utcnow(),
            "node_id": self.node_id,
            "latitude": base_lat + random.uniform(-0.0005, 0.0005),
            "longitude": base_lon + random.uniform(-0.0005, 0.0005),
            "ph": round(ph, 2),
            "turbidity_ntu": round(turb, 2),
            "ec_us_cm": round(ec, 2),
            "temperature_c": round(temp, 2),
            "particle_count": p_count,
            "avg_particle_size_um": round(p_size, 2)
        }

    def run_cycle(self):
        logger.info("=== Starting New Sampling Cycle ===")
        
        self.transition_to(NodeState.PUMPING, 2.0)
        logger.info("Activating 12V Peristaltic Pump...")
        
        self.transition_to(NodeState.STABILIZING, 1.5)
        logger.info("Waiting for water chamber to stabilize...")
        
        self.transition_to(NodeState.SENSOR_READ, 1.0)
        logger.info("Reading UART from ESP32 sensors (pH, Temp, EC, Turbidity)...")
        raw_data = self.simulate_readings()
        
        self.transition_to(NodeState.OPTICAL_SCREEN, 2.0)
        logger.info("Pi Camera v3 analyzing optical particle count and size...")
        
        self.transition_to(NodeState.JSON_EMIT, 0.5)
        
        # Validate through Pydantic if available
        if TelemetryPayload:
            if 'avg_particle_size_um' in raw_data:
                raw_data['avg_particle_size_mm'] = raw_data.pop('avg_particle_size_um') / 1000.0
            payload = TelemetryPayload(**raw_data).model_dump(mode='json')
        else:
            raw_data["timestamp"] = raw_data["timestamp"].isoformat() + "Z"
            payload = raw_data
            
        payload_str = json.dumps(payload, indent=2)
        logger.info(f"Emitting JSON Payload:\n{payload_str}")
        
        try:
            logger.info("Sending POST request to backend API...")
            api_url = os.getenv("API_URL", "http://localhost:8000/api/v1/telemetry/ingest")
            admin_key = os.getenv("ADMIN_API_KEY", "dev-admin-key-2026")
            headers = {"X-Admin-API-Key": admin_key}
            response = requests.post(api_url, json=payload, headers=headers, timeout=3)
            logger.info(f"API Response: {response.status_code} - {response.text}")
        except Exception as e:
            logger.warning(f"Failed to push telemetry to cloud: {e}")
        
        if self.export_json:
            with open("last_payload.json", "w") as f:
                f.write(payload_str)
                
        self.transition_to(NodeState.DRAIN, 1.5)
        logger.info("Draining sampling chamber...")
        
        self.transition_to(NodeState.IDLE, 0.5)
        logger.info("Cycle complete. Returning to IDLE.")
        print("-" * 50)

    def start(self):
        logger.info(f"Starting Node {self.node_id} Emulator | Mode: {self.anomaly} | Interval: {self.interval}s")
        try:
            while True:
                self.run_cycle()
                logger.info(f"Waiting {self.interval} seconds until next cycle...")
                time.sleep(self.interval)
        except KeyboardInterrupt:
            logger.info("Emulator stopped by user.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="VARUNA Edge Node Mock Telemetry")
    parser.add_argument("--node-id", type=str, default="VARUNA-NODE-001", help="Edge node ID")
    parser.add_argument("--interval", type=int, default=20, help="Sampling interval in seconds")
    parser.add_argument("--anomaly", type=str, choices=['normal', 'industrial_dump', 'heavy_rain', 'extreme_acidic'], default='normal', help="Anomaly injection mode")
    parser.add_argument("--export-json", action="store_true", help="Export latest payload to last_payload.json")
    
    args = parser.parse_args()
    
    emulator = MockTelemetryEmulator(args.node_id, args.interval, args.anomaly, args.export_json)
    emulator.start()
