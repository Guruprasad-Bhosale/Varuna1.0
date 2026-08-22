import numpy as np


# =========================================================
# SAGARDRISHTI
# FINAL RISK FUSION ENGINE
# =========================================================
#
# Historical ML model:
#   CHL
#   KD490
#   TSM
#   season
#   latitude
#   longitude
#   month
#   day_of_year
#   year
#   wave_height
#
# Additional evidence:
#   EOS-06 spectral evidence
#   sensor observations
#   microplastic observation
#
# IMPORTANT:
# Sensor and microplastic values are NOT used as
# artificial historical training data.
# They are optional real-time contextual inputs.
# =========================================================


def clip(value, minimum=0.0, maximum=1.0):

    if value is None:
        return 0.0

    return float(
        np.clip(value, minimum, maximum)
    )


# =========================================================
# SENSOR RISK
# =========================================================

def sensor_context_score(
    temperature=None,
    ph=None,
    turbidity=None,
    tds=None,
    water_level=None
):

    scores = []

    # -----------------------------------------------------
    # Temperature
    # -----------------------------------------------------
    #
    # We DO NOT assume one universal bloom threshold.
    # Until real training data is available, temperature
    # contributes only as contextual evidence.
    # -----------------------------------------------------

    if temperature is not None:

        temperature = float(temperature)

        # Moderate warm-water contextual signal
        if 25 <= temperature <= 32:
            scores.append(0.70)
        else:
            scores.append(0.30)


    # -----------------------------------------------------
    # pH
    # -----------------------------------------------------

    if ph is not None:

        ph = float(ph)

        # Slightly alkaline water is contextual evidence,
        # not a bloom diagnosis.
        if 7.5 <= ph <= 9.0:
            scores.append(0.60)
        else:
            scores.append(0.30)


    # -----------------------------------------------------
    # Turbidity
    # -----------------------------------------------------

    if turbidity is not None:

        turbidity = float(turbidity)

        # Extremely turbid water can produce optical
        # bloom-like signals caused by sediment.
        if turbidity > 100:
            scores.append(0.20)

        elif turbidity > 50:
            scores.append(0.40)

        else:
            scores.append(0.60)


    # -----------------------------------------------------
    # TDS
    # -----------------------------------------------------

    if tds is not None:

        tds = float(tds)

        # Context only.
        #
        # No universal TDS bloom threshold is assumed.
        scores.append(0.50)


    # -----------------------------------------------------
    # Water level
    # -----------------------------------------------------

    if water_level is not None:

        # Hydrological context only.
        scores.append(0.50)


    # -----------------------------------------------------
    # No sensor data
    # -----------------------------------------------------

    if not scores:
        return None


    return float(
        np.mean(scores)
    )


# =========================================================
# MICROPLASTIC CONTEXT
# =========================================================

def microplastic_context_score(
    microplastic_particles_m3=None
):

    if microplastic_particles_m3 is None:
        return None

    value = float(
        microplastic_particles_m3
    )

    # IMPORTANT:
    #
    # We do NOT claim that microplastic concentration
    # directly predicts an algal bloom.
    #
    # This is a pollution/stressor indicator.
    #
    # The current research dataset is too small to
    # establish a scientifically validated bloom threshold.
    #

    if value <= 0:
        return 0.0

    if value < 10:
        return 0.25

    if value < 20:
        return 0.50

    if value < 50:
        return 0.75

    return 1.0


# =========================================================
# FINAL SAGARDRISHTI FUSION
# =========================================================

def sagardrishti_fusion(
    ml_probability,
    spectral_evidence=None,
    sensor_score=None,
    microplastic_score=None
):

    ml_probability = clip(
        ml_probability
    )


    # -----------------------------------------------------
    # Base ML prediction
    # -----------------------------------------------------

    final_score = (
        0.75 * ml_probability
    )


    # -----------------------------------------------------
    # EOS-06 spectral evidence
    # -----------------------------------------------------

    if spectral_evidence is not None:

        final_score += (
            0.15 *
            clip(spectral_evidence)
        )


    # -----------------------------------------------------
    # Sensor context
    # -----------------------------------------------------

    if sensor_score is not None:

        final_score += (
            0.07 *
            clip(sensor_score)
        )


    # -----------------------------------------------------
    # Microplastic pollution context
    # -----------------------------------------------------

    if microplastic_score is not None:

        final_score += (
            0.03 *
            clip(microplastic_score)
        )


    final_score = clip(
        final_score
    )


    # =====================================================
    # RISK CATEGORY
    # =====================================================

    if final_score < 0.30:

        category = "LOW"

    elif final_score < 0.50:

        category = "MODERATE"

    elif final_score < 0.70:

        category = "HIGH"

    else:

        category = "VERY_HIGH"


    return {
        "final_risk_score": round(
            final_score, 4
        ),
        "risk_category": category
    }


# =========================================================
# TEST
# =========================================================

if __name__ == "__main__":

    print("=" * 60)
    print("SAGARDRISHTI FUSION ENGINE")
    print("=" * 60)


    # Example ONLY for testing the software.
    # These are not training values.

    sensor_score = sensor_context_score(
        temperature=28,
        ph=8.1,
        turbidity=20,
        tds=500,
        water_level=1
    )


    microplastic_score = (
        microplastic_context_score(
            16.11
        )
    )


    result = sagardrishti_fusion(

        ml_probability=0.80,

        spectral_evidence=0.75,

        sensor_score=sensor_score,

        microplastic_score=microplastic_score
    )


    print("\nSensor context score:")
    print(sensor_score)

    print("\nMicroplastic context score:")
    print(microplastic_score)

    print("\nSagardrishti result:")
    print(result)

    print("\nDONE!")