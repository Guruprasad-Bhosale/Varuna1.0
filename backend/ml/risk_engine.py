"""
NIRVAAH - Environmental + ML Risk Engine

Combines:
1. XGBoost bloom-risk probability
2. pH
3. Turbidity
4. Electrical Conductivity (EC)
5. Temperature anomaly

Output:
- Individual signal risks
- Overall NIRVAAH risk
- Explanation
- Recommended action
"""

def clamp(val, min_val, max_val):
    return max(min_val, min(val, max_val))

def evaluate_ph(ph):
    if 6.5 <= ph <= 8.5:
        i_ph = 0.0
    elif ph < 6.5:
        i_ph = min(1.0, (6.5 - ph) / 1.5)
    else:
        i_ph = min(1.0, (ph - 8.5) / 1.5)

    if i_ph >= 0.66:
        return "HIGH", 2, i_ph
    elif i_ph > 0.0:
        return "WARNING", 1, i_ph
    else:
        return "NORMAL", 0, i_ph

def evaluate_turbidity(turbidity):
    i_turb = clamp((turbidity - 10.0) / 20.0, 0.0, 1.0)
    if i_turb >= 0.66:
        return "HIGH", 2, i_turb
    elif i_turb > 0.0:
        return "WARNING", 1, i_turb
    else:
        return "NORMAL", 0, i_turb

def evaluate_ec(ec):
    i_ec = clamp((ec - 600.0) / 600.0, 0.0, 1.0)
    if i_ec >= 0.66:
        return "HIGH", 2, i_ec
    elif i_ec > 0.0:
        return "WARNING", 1, i_ec
    else:
        return "NORMAL", 0, i_ec

def evaluate_temperature(temp_anomaly):
    i_dt = clamp((temp_anomaly - 0.5) / 2.5, 0.0, 1.0)
    if i_dt >= 0.66:
        return "HIGH", 2, i_dt
    elif i_dt > 0.0:
        return "WARNING", 1, i_dt
    else:
        return "NORMAL", 0, i_dt

def evaluate_ml_probability(bloom_probability):
    if bloom_probability >= 0.90:
        return "VERY HIGH", 3
    elif bloom_probability >= 0.80:
        return "HIGH", 2
    elif bloom_probability >= 0.50:
        return "MODERATE", 1
    else:
        return "LOW", 0

def calculate_nirvaah_risk(bloom_probability, ph, turbidity, ec, temperature_anomaly):
    ml_risk, ml_score = evaluate_ml_probability(bloom_probability)
    ph_risk, ph_score, i_ph = evaluate_ph(ph)
    turbidity_risk, turbidity_score, i_turb = evaluate_turbidity(turbidity)
    ec_risk, ec_score, i_ec = evaluate_ec(ec)
    temperature_risk, temperature_score, i_dt = evaluate_temperature(temperature_anomaly)

    environmental_score = ph_score + turbidity_score + ec_score + temperature_score

    if ml_score == 3 or environmental_score >= 6:
        final_risk = "VERY HIGH"
        final_level = 3
    elif ml_score >= 2 or environmental_score >= 4:
        final_risk = "HIGH"
        final_level = 2
    elif ml_score >= 1 or environmental_score >= 2:
        final_risk = "MODERATE"
        final_level = 1
    else:
        final_risk = "LOW"
        final_level = 0

    reasons = []
    if ml_score >= 2:
        reasons.append(f"High ML bloom-risk probability ({bloom_probability:.3f})")
    if ph_score > 0:
        reasons.append(f"pH anomaly ({ph:.2f})")
    if turbidity_score > 0:
        reasons.append(f"Elevated turbidity ({turbidity:.1f} NTU)")
    if ec_score > 0:
        reasons.append(f"Electrical conductivity anomaly ({ec:.0f} µS/cm)")
    if temperature_score > 0:
        reasons.append(f"Temperature anomaly ({temperature_anomaly:+.1f}°C)")

    if not reasons:
        reasons.append("No significant environmental or ML risk signals detected.")

    if final_level == 3:
        recommendation = "HIGH PRIORITY: Restrict fishing in the affected area and initiate environmental investigation."
    elif final_level == 2:
        recommendation = "CAUTION: Increase monitoring and investigate the affected area before fishing."
    elif final_level == 1:
        recommendation = "MONITOR: Continue observation and collect additional sensor measurements."
    else:
        recommendation = "NORMAL: Area currently shows low bloom-risk signals."

    # Mathematical Equation from Architecture Spec
    safety_score = 100.0 * (1.0 - clamp(
        0.45 * bloom_probability +
        0.20 * i_ph +
        0.15 * i_turb +
        0.10 * i_ec +
        0.10 * i_dt,
        0.0, 1.0
    ))

    return {
        "bloom_probability": bloom_probability,
        "ml_risk": ml_risk,
        "ph": ph,
        "ph_risk": ph_risk,
        "turbidity": turbidity,
        "turbidity_risk": turbidity_risk,
        "ec": ec,
        "ec_risk": ec_risk,
        "temperature_anomaly": temperature_anomaly,
        "temperature_risk": temperature_risk,
        "environmental_score": environmental_score,
        "final_risk": final_risk,
        "final_level": final_level,
        "reasons": reasons,
        "recommendation": recommendation,
        "composite_score": safety_score
    }
