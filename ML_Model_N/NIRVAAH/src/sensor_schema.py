# =========================================================
# SAGARDRISHTI SENSOR CONFIGURATION
# =========================================================

SENSOR_FEATURES = {

    "water_temperature": {
        "unit": "degC",
        "sensor": "DS18B20",
        "role": "environmental_driver",
        "priority": "HIGH"
    },

    "pH": {
        "unit": "pH",
        "sensor": "PH-4502C",
        "role": "environmental_driver",
        "priority": "MEDIUM"
    },

    "turbidity": {
        "unit": "NTU",
        "sensor": "Analog Turbidity Sensor",
        "role": "optical_context",
        "priority": "HIGH"
    },

    "TDS": {
        "unit": "ppm",
        "sensor": "Analog TDS V1.0",
        "role": "water_quality_context",
        "priority": "MEDIUM"
    },

    "water_level": {
        "unit": "digital",
        "sensor": "Float Sensor",
        "role": "hydrological_context",
        "priority": "LOW"
    },

    "camera": {
        "unit": "image",
        "sensor": "Pi Camera Module 3",
        "role": "computer_vision",
        "priority": "HIGH"
    },

    "microplastic_particles_m3": {
        "unit": "particles/m3",
        "sensor": "Microplastic Optical Sensor",
        "role": "pollution_context",
        "priority": "EXTERNAL"
    }
}


print("SAGARDRISHTI SENSOR CONFIGURATION")
print("=" * 50)

for name, config in SENSOR_FEATURES.items():

    print(
        f"{name:30} "
        f"{config['role']:25} "
        f"{config['priority']}"
    )