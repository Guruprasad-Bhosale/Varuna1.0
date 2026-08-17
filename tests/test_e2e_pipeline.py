import pytest
from fastapi.testclient import TestClient
from backend.main import app
import json

client = TestClient(app)

def test_health():
    """Verify the API is up and running."""
    # Assuming there's a health endpoint, if not, we check root or docs.
    # In Phase 1 we mapped GET / (or similar), let's check a basic known endpoint.
    response = client.get("/docs")
    assert response.status_code == 200

def test_ingest_dangerous_payload():
    """Simulate an edge node sending highly hazardous water metrics."""
    payload = {
        "node_id": "VARUNA-TEST-001",
        "latitude": 16.705,
        "longitude": 74.243,
        "ph": 3.1, # Extremely acidic
        "turbidity_ntu": 400.0, # Highly turbid
        "ec_us_cm": 5000.0, # High Electrical Conductivity
        "temperature_c": 35.5,
        "particle_count": 850,
        "avg_particle_size_mm": 3.0,
        "timestamp": "2026-08-14T12:00:00Z"
    }
    
    # 1. Ingest telemetry
    response = client.post("/api/v1/telemetry/ingest", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    # ML Prediction validation - should be flagged as an anomaly
    assert "status" in data
    assert data["predicted_safety_level"] == "Dangerous"
    assert data["alert_sent"] == True
    
    # 2. Check Latest Endpoint
    latest_response = client.get("/api/v1/telemetry/latest?node_id=VARUNA-TEST-001")
    assert latest_response.status_code == 200
    latest_data = latest_response.json()
    assert latest_data["ph"] == 3.1
    assert latest_data["predicted_safety_level"] == "Dangerous"
    
    # 3. Check Alerts Endpoint (should log the anomaly)
    alerts_response = client.get("/api/v1/telemetry/alerts")
    assert alerts_response.status_code == 200
    alerts_data = alerts_response.json()
    
    # Ensure at least one alert exists and our test node is captured
    assert len(alerts_data) > 0
    test_alerts = [a for a in alerts_data if a["node_id"] == "VARUNA-TEST-001"]
    assert len(test_alerts) > 0
    assert test_alerts[0]["predicted_safety_level"] == "Dangerous"
