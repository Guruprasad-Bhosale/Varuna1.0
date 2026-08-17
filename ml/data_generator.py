import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
import os
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Constants
START_DATE = datetime(2023, 1, 1)
NUM_RECORDS = 5000
NODE_ID = "VARUNA-NODE-001"
# Varanasi, Ganga River coordinates
BASE_LAT = 25.3176
BASE_LON = 82.9739

def calculate_sub_index(value, breakpoints):
    """
    Calculate sub-index for a parameter based on breakpoints.
    breakpoints = [(val1, index1), (val2, index2), ...]
    """
    for i in range(len(breakpoints) - 1):
        v1, i1 = breakpoints[i]
        v2, i2 = breakpoints[i+1]
        if v1 <= value <= v2:
            return i1 + (i2 - i1) * (value - v1) / (v2 - v1)
    # Extrapolate if outside bounds
    if value < breakpoints[0][0]:
        return breakpoints[0][1]
    return breakpoints[-1][1]

def compute_safety_score(ph, turb, ec):
    """
    Compute a realistic safety score (0-100) using pseudo-CPCB indices.
    Higher score = Safer.
    """
    # Breakpoints (Value, Score out of 100) - inverted so 100 is best
    # pH: optimal 6.5-8.5
    ph_bp = [(0, 0), (4.5, 20), (6.5, 100), (8.5, 100), (10.0, 20), (14, 0)]
    # Turbidity: optimal < 5 NTU
    turb_bp = [(0, 100), (5, 90), (10, 70), (50, 40), (200, 10), (500, 0)]
    # EC: optimal < 500
    ec_bp = [(0, 100), (300, 95), (600, 80), (1200, 40), (3000, 10), (5000, 0)]
    
    s_ph = calculate_sub_index(ph, ph_bp)
    s_turb = calculate_sub_index(turb, turb_bp)
    s_ec = calculate_sub_index(ec, ec_bp)
    
    # Weighted average
    weights = [0.3, 0.3, 0.4]
    scores = [s_ph, s_turb, s_ec]
    
    avg_score = sum(s * w for s, w in zip(scores, weights))
    min_score = min(scores)
    
    # Final score blends average with the worst parameter to penalize extreme violations
    final_score = (avg_score * 0.4) + (min_score * 0.6)
    return max(0.0, min(100.0, final_score))

def determine_label(score):
    """
    0: Safe (score >= 70)
    1: Moderate (40 <= score < 70)
    2: Dangerous (score < 40)
    """
    if score >= 70:
        return 0
    elif score >= 40:
        return 1
    else:
        return 2

def generate_dataset(output_path: str):
    logger.info(f"Generating synthetic dataset with {NUM_RECORDS} records...")
    
    records = []
    current_time = START_DATE
    
    for i in range(NUM_RECORDS):
        # Time progression (Hourly)
        current_time += timedelta(hours=1)
        
        # Temporal features
        hour = current_time.hour
        month = current_time.month
        day_of_week = current_time.weekday()
        
        # Base seasonal and diurnal variations
        # Summer (Apr-Jun), Monsoon (Jul-Sep), Winter (Dec-Feb)
        is_monsoon = 7 <= month <= 9
        
        diurnal_temp = 3 * np.sin((hour - 6) * np.pi / 12) # peaks around 12-2 PM
        seasonal_temp = 25 + 8 * np.sin((month - 4) * np.pi / 6) # Peaks in June/July
        
        temp_c = seasonal_temp + diurnal_temp + np.random.normal(0, 0.5)
        
        # Determine current state (Normal, Industrial Spike, Runoff)
        rand_val = np.random.random()
        
        if rand_val < 0.05:
            # Industrial Dump (5% chance)
            ph = np.random.uniform(4.5, 6.0) if np.random.random() < 0.5 else np.random.uniform(8.8, 11.0)
            ec_us_cm = np.random.uniform(1200, 3500)
            turbidity_ntu = np.random.uniform(10, 50)
            particle_count = int(np.random.uniform(80, 200))
            avg_particle_size_um = np.random.uniform(5.0, 15.0)
        elif is_monsoon and rand_val < 0.3:
            # Monsoon Runoff / Heavy Rain
            ph = np.random.uniform(6.5, 7.5)
            ec_us_cm = np.random.uniform(100, 300) # Dilution effect
            turbidity_ntu = np.random.uniform(30, 200)
            particle_count = int(np.random.uniform(150, 600))
            avg_particle_size_um = np.random.uniform(20.0, 45.0)
        else:
            # Normal State
            ph = np.random.uniform(6.8, 8.2)
            ec_us_cm = np.random.uniform(150, 600)
            turbidity_ntu = np.random.uniform(2, 10)
            particle_count = int(np.random.uniform(10, 80))
            avg_particle_size_um = np.random.uniform(5.0, 15.0)
        
        # Add some noise
        ph += np.random.normal(0, 0.1)
        ec_us_cm += np.random.normal(0, 10)
        turbidity_ntu = max(0.1, turbidity_ntu + np.random.normal(0, 1))
        temp_c = max(0.1, temp_c)
        
        score = compute_safety_score(ph, turbidity_ntu, ec_us_cm)
        label = determine_label(score)
        
        record = {
            "timestamp": current_time.isoformat() + "Z",
            "node_id": NODE_ID,
            "latitude": BASE_LAT + np.random.normal(0, 0.0001),
            "longitude": BASE_LON + np.random.normal(0, 0.0001),
            "ph": round(ph, 2),
            "turbidity_ntu": round(turbidity_ntu, 2),
            "ec_us_cm": round(ec_us_cm, 2),
            "temperature_c": round(temp_c, 2),
            "particle_count": particle_count,
            "avg_particle_size_um": round(avg_particle_size_um, 2),
            "hour": hour,
            "month": month,
            "day_of_week": day_of_week,
            "safety_score": round(score, 2),
            "safety_label": label
        }
        records.append(record)
        
    df = pd.DataFrame(records)
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    logger.info(f"Dataset generated successfully at {output_path}")

if __name__ == "__main__":
    # Ensure run from project root or handles path correctly
    current_dir = Path(__file__).parent
    output_path = current_dir / "data" / "varuna_water_quality_v1.csv"
    generate_dataset(str(output_path))
