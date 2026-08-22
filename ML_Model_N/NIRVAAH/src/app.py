import streamlit as st
import pandas as pd
import numpy as np

from xgboost import XGBClassifier


# ============================================================
# SAGARDRISHTI
# FINAL ALGAL BLOOM PREDICTION SYSTEM
# ============================================================

MODEL_FILE = (
    "../data/processed/"
    "sagardrishti_final_xgboost.json"
)

THRESHOLD_FILE = (
    "../data/processed/"
    "sagardrishti_threshold.txt"
)


# ============================================================
# PAGE CONFIG
# ============================================================

st.set_page_config(
    page_title="Sagardrishti",
    page_icon="🌊",
    layout="wide"
)


# ============================================================
# LOAD MODEL
# ============================================================

@st.cache_resource
def load_model():

    model = XGBClassifier()

    model.load_model(
        MODEL_FILE
    )

    return model


@st.cache_data
def load_threshold():

    try:

        with open(
            THRESHOLD_FILE,
            "r"
        ) as f:

            return float(
                f.read().strip()
            )

    except Exception:

        # Locked validation-derived threshold
        return 0.30


model = load_model()

THRESHOLD = load_threshold()


# ============================================================
# SEASON ENCODING
# SAME AS TRAINING
# ============================================================

SEASON_MAP = {

    "monsoon": 0,

    "post_monsoon": 1,

    "pre_monsoon": 2,

    "winter": 3
}


# ============================================================
# SENSOR CONTEXT
# ============================================================

def calculate_sensor_context(
    temperature=None,
    ph=None,
    turbidity=None,
    tds=None,
    water_level=None
):

    scores = []


    # --------------------------------------------------------
    # TEMPERATURE
    # --------------------------------------------------------

    if temperature is not None:

        if 25 <= temperature <= 32:

            scores.append(0.70)

        else:

            scores.append(0.30)


    # --------------------------------------------------------
    # pH
    # --------------------------------------------------------

    if ph is not None:

        if 7.5 <= ph <= 9.0:

            scores.append(0.60)

        else:

            scores.append(0.30)


    # --------------------------------------------------------
    # TURBIDITY
    # --------------------------------------------------------

    if turbidity is not None:

        if turbidity > 100:

            scores.append(0.20)

        elif turbidity > 50:

            scores.append(0.40)

        else:

            scores.append(0.60)


    # --------------------------------------------------------
    # TDS
    # --------------------------------------------------------

    if tds is not None:

        scores.append(0.50)


    # --------------------------------------------------------
    # WATER LEVEL
    # --------------------------------------------------------

    if water_level is not None:

        scores.append(0.50)


    if not scores:

        return None


    return float(
        np.mean(scores)
    )


# ============================================================
# MICROPLASTIC CONTEXT
# ============================================================

def calculate_microplastic_context(
    concentration
):

    if concentration is None:

        return None


    concentration = float(
        concentration
    )


    if concentration <= 0:

        return 0.0

    elif concentration < 10:

        return 0.25

    elif concentration < 20:

        return 0.50

    elif concentration < 50:

        return 0.75

    else:

        return 1.0


# ============================================================
# CONTEXTUAL FUSION
# ============================================================

def calculate_contextual_risk(
    ml_probability,
    sensor_score=None,
    microplastic_score=None,
    spectral_evidence=None
):

    # --------------------------------------------------------
    # IMPORTANT:
    #
    # ML probability remains the primary prediction.
    #
    # Sensor/microplastic values are contextual evidence.
    # They were NOT used to retrain the historical model.
    # --------------------------------------------------------

    score = (
        0.75 * ml_probability
    )


    if spectral_evidence is not None:

        score += (
            0.15 *
            np.clip(
                spectral_evidence,
                0,
                1
            )
        )


    if sensor_score is not None:

        score += (
            0.07 *
            np.clip(
                sensor_score,
                0,
                1
            )
        )


    if microplastic_score is not None:

        score += (
            0.03 *
            np.clip(
                microplastic_score,
                0,
                1
            )
        )


    score = float(
        np.clip(
            score,
            0,
            1
        )
    )


    if score < 0.30:

        category = "LOW"

    elif score < 0.50:

        category = "MODERATE"

    elif score < 0.70:

        category = "HIGH"

    else:

        category = "VERY HIGH"


    return score, category


# ============================================================
# HEADER
# ============================================================

st.title(
    "🌊 SAGARDRISHTI"
)

st.subheader(
    "AI-Powered Algal Bloom Early Warning System"
)

st.write(
    "Satellite + Environmental Sensor + "
    "Microplastic Context"
)

st.divider()


# ============================================================
# MODEL STATUS
# ============================================================

col1, col2, col3 = st.columns(3)


with col1:

    st.metric(
        "Model",
        "XGBoost"
    )


with col2:

    st.metric(
        "Decision Threshold",
        f"{THRESHOLD:.2f}"
    )


with col3:

    st.metric(
        "Final Test Recall",
        "84.60%"
    )


st.divider()


# ============================================================
# SATELLITE INPUTS
# ============================================================

st.header(
    "🛰️ Satellite / Environmental Inputs"
)


col1, col2 = st.columns(2)


with col1:

    chl = st.number_input(
        "Chlorophyll-a (CHL)",
        min_value=0.0,
        value=0.5,
        step=0.01
    )


    kd490 = st.number_input(
        "KD490",
        min_value=0.0,
        value=0.07,
        step=0.001
    )


    tsm = st.number_input(
        "TSM",
        min_value=0.0,
        value=7.0,
        step=0.1
    )


    wave_height = st.number_input(
        "Wave Height",
        min_value=0.0,
        value=0.8,
        step=0.1
    )


with col2:

    latitude = st.number_input(
        "Latitude",
        value=20.0,
        format="%.6f"
    )


    longitude = st.number_input(
        "Longitude",
        value=72.0,
        format="%.6f"
    )


    date = st.date_input(
        "Observation Date"
    )


    season = st.selectbox(
        "Season",
        [
            "monsoon",
            "post_monsoon",
            "pre_monsoon",
            "winter"
        ]
    )


# ============================================================
# DERIVED TEMPORAL FEATURES
# ============================================================

timestamp = pd.Timestamp(
    date
)

month = timestamp.month

day_of_year = (
    timestamp.dayofyear
)

year = timestamp.year

season_code = SEASON_MAP[
    season
]


# ============================================================
# SENSOR INPUTS
# ============================================================

st.divider()

st.header(
    "📡 Real-Time Sensor Inputs"
)

st.caption(
    "Leave a field empty if the sensor is not currently available. "
    "These values are contextual and are not artificially inserted "
    "into the historical ML training dataset."
)


col1, col2 = st.columns(2)


with col1:

    temperature_input = st.number_input(
        "Water Temperature (°C)",
        min_value=0.0,
        value=None,
        placeholder="Optional"
    )


    ph_input = st.number_input(
        "pH",
        min_value=0.0,
        max_value=14.0,
        value=None,
        placeholder="Optional"
    )


    turbidity_input = st.number_input(
        "Turbidity (NTU)",
        min_value=0.0,
        value=None,
        placeholder="Optional"
    )


with col2:

    tds_input = st.number_input(
        "TDS (ppm)",
        min_value=0.0,
        value=None,
        placeholder="Optional"
    )


    water_level_input = st.number_input(
        "Water Level",
        min_value=0.0,
        value=None,
        placeholder="Optional"
    )


    microplastic_input = st.number_input(
        "Microplastic concentration (particles/m³)",
        min_value=0.0,
        value=None,
        placeholder="Optional"
    )


# ============================================================
# EOS-06 SPECTRAL EVIDENCE
# ============================================================

st.divider()

st.header(
    "🔬 EOS-06 Spectral Evidence"
)

st.caption(
    "Optional spectral bloom-evidence score from the "
    "EOS-06 spectral processing pipeline."
)


spectral_input = st.number_input(
    "Spectral Bloom Evidence (0–1)",
    min_value=0.0,
    max_value=1.0,
    value=None,
    placeholder="Optional"
)


# ============================================================
# PREDICT BUTTON
# ============================================================

st.divider()

predict_button = st.button(
    "🔍 PREDICT BLOOM RISK",
    type="primary",
    use_container_width=True
)


# ============================================================
# PREDICTION
# ============================================================

if predict_button:

    # --------------------------------------------------------
    # CREATE MODEL INPUT
    # --------------------------------------------------------

    input_data = pd.DataFrame({

        "chl": [chl],

        "kd490": [kd490],

        "tsm": [tsm],

        "wave_height": [
            wave_height
        ],

        "latitude": [
            latitude
        ],

        "longitude": [
            longitude
        ],

        "month": [
            month
        ],

        "day_of_year": [
            day_of_year
        ],

        "year": [
            year
        ],

        "season": [
            season_code
        ]

    })


    # --------------------------------------------------------
    # ML PROBABILITY
    # --------------------------------------------------------

    ml_probability = float(
        model.predict_proba(
            input_data
        )[0][1]
    )


    # --------------------------------------------------------
    # ML CLASSIFICATION
    # --------------------------------------------------------

    if ml_probability >= THRESHOLD:

        ml_prediction = (
            "BLOOM RISK"
        )

    else:

        ml_prediction = (
            "NORMAL / NO BLOOM"
        )


    # --------------------------------------------------------
    # SENSOR CONTEXT
    # --------------------------------------------------------

    sensor_score = (
        calculate_sensor_context(

            temperature=
                temperature_input,

            ph=
                ph_input,

            turbidity=
                turbidity_input,

            tds=
                tds_input,

            water_level=
                water_level_input
        )
    )


    # --------------------------------------------------------
    # MICROPLASTIC CONTEXT
    # --------------------------------------------------------

    microplastic_score = (
        calculate_microplastic_context(

            microplastic_input
        )
    )


    # --------------------------------------------------------
    # FINAL CONTEXTUAL RISK
    # --------------------------------------------------------

    contextual_score, contextual_category = (
        calculate_contextual_risk(

            ml_probability=

                ml_probability,

            sensor_score=

                sensor_score,

            microplastic_score=

                microplastic_score,

            spectral_evidence=

                spectral_input
        )
    )


    # ========================================================
    # RESULTS
    # ========================================================

    st.divider()

    st.header(
        "🚨 Sagardrishti Prediction"
    )


    col1, col2, col3 = st.columns(3)


    with col1:

        st.metric(
            "Bloom Probability",
            f"{ml_probability * 100:.2f}%"
        )


    with col2:

        st.metric(
            "ML Classification",
            ml_prediction
        )


    with col3:

        st.metric(
            "Decision Threshold",
            f"{THRESHOLD:.2f}"
        )


    # ========================================================
    # MAIN ALERT
    # ========================================================

    if ml_probability >= THRESHOLD:

        st.error(
            "🚨 BLOOM RISK DETECTED"
        )

        st.write(
            "The predicted bloom probability is above "
            "the validated decision threshold."
        )

    else:

        st.success(
            "✅ NORMAL / NO BLOOM"
        )

        st.write(
            "The predicted bloom probability is below "
            "the validated decision threshold."
        )


    # ========================================================
    # CONTEXTUAL RISK
    # ========================================================

    st.divider()

    st.subheader(
        "🌊 Environmental Context"
    )


    col1, col2 = st.columns(2)


    with col1:

        st.metric(
            "Contextual Risk Score",
            f"{contextual_score * 100:.2f}%"
        )


    with col2:

        st.metric(
            "Contextual Risk Category",
            contextual_category
        )


    # ========================================================
    # INPUT SUMMARY
    # ========================================================

    st.divider()

    st.subheader(
        "📊 Prediction Inputs"
    )


    input_display = pd.DataFrame({

        "Parameter": [

            "CHL",

            "KD490",

            "TSM",

            "Wave Height",

            "Latitude",

            "Longitude",

            "Month",

            "Day of Year",

            "Year",

            "Season"
        ],

        "Value": [

            chl,

            kd490,

            tsm,

            wave_height,

            latitude,

            longitude,

            month,

            day_of_year,

            year,

            season
        ]

    })


    st.dataframe(
        input_display,
        use_container_width=True,
        hide_index=True
    )


    # ========================================================
    # SENSOR SUMMARY
    # ========================================================

    st.subheader(
        "📡 Sensor Context"
    )


    sensor_display = pd.DataFrame({

        "Sensor": [

            "Temperature",

            "pH",

            "Turbidity",

            "TDS",

            "Water Level",

            "Microplastics"
        ],

        "Value": [

            temperature_input
            if temperature_input is not None
            else "Not available",

            ph_input
            if ph_input is not None
            else "Not available",

            turbidity_input
            if turbidity_input is not None
            else "Not available",

            tds_input
            if tds_input is not None
            else "Not available",

            water_level_input
            if water_level_input is not None
            else "Not available",

            microplastic_input
            if microplastic_input is not None
            else "Not available"
        ]

    })


    st.dataframe(
        sensor_display,
        use_container_width=True,
        hide_index=True
    )


    # ========================================================
    # MODEL EXPLANATION
    # ========================================================

    st.divider()

    st.subheader(
        "🧠 Model Explanation"
    )


    st.write(
        """
        Sagardrishti's historical ML model uses 10
        satellite/environmental features:
        CHL, KD490, TSM, wave height, latitude,
        longitude, month, day of year, year and season.
        """
    )


    st.write(
        """
        The model was evaluated using a validation-selected
        probability threshold of 0.30. Real-time sensor and
        microplastic measurements are displayed as contextual
        evidence and are not treated as artificially generated
        historical training observations.
        """
    )


    # ========================================================
    # FINAL PERFORMANCE
    # ========================================================

    st.divider()

    st.subheader(
        "📈 Validated Model Performance"
    )


    performance = pd.DataFrame({

        "Metric": [

            "Accuracy",

            "Precision",

            "Recall",

            "F1 Score",

            "ROC-AUC",

            "PR-AUC"
        ],

        "Value": [

            "98.32%",

            "77.26%",

            "84.60%",

            "80.76%",

            "99.42%",

            "89.37%"
        ]

    })


    st.dataframe(
        performance,
        use_container_width=True,
        hide_index=True
    )


# ============================================================
# FOOTER
# ============================================================

st.divider()

st.caption(
    "Sagardrishti | AI-based coastal algal bloom "
    "early-warning and environmental monitoring system"
)

# ============================================================
# HISTORICAL INTELLIGENCE
# ============================================================

st.divider()

st.header(
    "📚 Historical Intelligence — Data Behind SAGARDRISHTI"
)

st.write(
    "SAGARDRISHTI's AI predictions are supported by "
    "historical ocean observations used during model "
    "development and spatial hotspot analysis."
)


# ============================================================
# LOAD HISTORICAL DATA
# ============================================================

@st.cache_data
def load_historical_data():

    possible_files = [

        "../data/processed/"
        "nirvaah_final_predictions.parquet",

        "../data/processed/"
        "nirvaah_risk_predictions.parquet",

        "../data/processed/"
        "nirvaah_test_predictions.parquet"
    ]

    for file in possible_files:

        try:

            data = pd.read_parquet(file)

            if len(data) > 0:

                return data, file

        except Exception:

            continue

    return None, None


historical_df, historical_file = (
    load_historical_data()
)


# ============================================================
# HISTORICAL DATA INFORMATION
# ============================================================

if historical_df is not None:

    # --------------------------------------------------------
    # NUMBER OF OBSERVATIONS
    # --------------------------------------------------------

    historical_observations = len(
        historical_df
    )


    # --------------------------------------------------------
    # SPATIAL LOCATIONS
    # --------------------------------------------------------

    if (
        "latitude" in historical_df.columns
        and
        "longitude" in historical_df.columns
    ):

        spatial_locations = (
            historical_df[
                [
                    "latitude",
                    "longitude"
                ]
            ]
            .drop_duplicates()
            .shape[0]
        )

    else:

        spatial_locations = 0


    # --------------------------------------------------------
    # ML FEATURES
    # --------------------------------------------------------

    ml_feature_candidates = [

        "chl",
        "kd490",
        "tsm",
        "wave_height",
        "latitude",
        "longitude",
        "month",
        "day_of_year",
        "year",
        "season"
    ]

    ml_features_available = [

        x for x in ml_feature_candidates

        if x in historical_df.columns
    ]


    # --------------------------------------------------------
    # TRAINING PERIOD
    # --------------------------------------------------------

    if "year" in historical_df.columns:

        min_year = int(
            historical_df["year"].min()
        )

        max_year = int(
            historical_df["year"].max()
        )

        training_period = (
            f"{min_year}–{max_year}"
        )

    elif "time" in historical_df.columns:

        dates = pd.to_datetime(
            historical_df["time"],
            errors="coerce"
        )

        training_period = (
            f"{dates.dt.year.min()}–"
            f"{dates.dt.year.max()}"
        )

    else:

        training_period = "Historical"


    # ========================================================
    # TOP METRICS
    # ========================================================

    col1, col2, col3, col4, col5 = st.columns(5)


    with col1:

        st.metric(
            "🌊 Historical Observations",
            f"{historical_observations:,}"
        )


    with col2:

        st.metric(
            "📍 Spatial Locations",
            f"{spatial_locations:,}"
        )


    with col3:

        st.metric(
            "🧠 ML Features",
            len(ml_features_available)
        )


    with col4:

        st.metric(
            "◉ Model",
            "XGBoost"
        )


    with col5:

        st.metric(
            "📅 Historical Period",
            training_period
        )


    # ========================================================
    # DATASET TABLE
    # ========================================================

    st.subheader(
        "🧬 Historical Dataset Used by SAGARDRISHTI"
    )


    dataset_information = pd.DataFrame({

        "Component": [

            "Ocean observations",

            "Historical period",

            "Spatial locations",

            "ML features",

            "Primary optical variables",

            "Environmental variables",

            "Prediction target"
        ],

        "SAGARDRISHTI Data": [

            f"{historical_observations:,}",

            training_period,

            f"{spatial_locations:,}",

            len(ml_features_available),

            "CHL, KD490, TSM",

            "Wave height + spatial/temporal features",

            "Bloom Risk Proxy"
        ]

    })


    st.dataframe(

        dataset_information,

        use_container_width=True,

        hide_index=True
    )


    # ========================================================
    # HISTORICAL BLOOM HOTSPOTS
    # ========================================================

    st.divider()


    st.header(
        "🔥 Historical AI-Predicted Bloom Hotspots"
    )


    st.write(
        "Locations below represent spatial cells where "
        "SAGARDRISHTI identified elevated historical "
        "bloom-risk."
    )


    # ========================================================
    # PREPARE MAP DATA
    # ========================================================

    map_df = historical_df.copy()


    required_columns = [

        "latitude",
        "longitude"
    ]


    if all(
        c in map_df.columns
        for c in required_columns
    ):

        # ----------------------------------------------------
        # FIND BLOOM PROBABILITY COLUMN
        # ----------------------------------------------------

        probability_column = None


        probability_candidates = [

            "bloom_probability",

            "bloom_prob",

            "bloom_risk_score",

            "final_risk_score"
        ]


        for column in probability_candidates:

            if column in map_df.columns:

                probability_column = column

                break


        # ----------------------------------------------------
        # FIND RISK CATEGORY
        # ----------------------------------------------------

        category_column = None


        category_candidates = [

            "bloom_risk_category",

            "risk_category",

            "final_risk_category"
        ]


        for column in category_candidates:

            if column in map_df.columns:

                category_column = column

                break


        # ----------------------------------------------------
        # PREPARE PROBABILITY
        # ----------------------------------------------------

        if probability_column is not None:

            map_df[
                "Bloom Risk Probability"
            ] = pd.to_numeric(

                map_df[
                    probability_column
                ],

                errors="coerce"

            ).fillna(0)


        else:

            # If probability does not exist,
            # create a simple risk value from bloom proxy.

            if "bloom_proxy" in map_df.columns:

                map_df[
                    "Bloom Risk Probability"
                ] = map_df[
                    "bloom_proxy"
                ].astype(float)

            else:

                map_df[
                    "Bloom Risk Probability"
                ] = 0.0


        # ----------------------------------------------------
        # CLEAN LOCATION
        # ----------------------------------------------------

        map_df["latitude"] = pd.to_numeric(
            map_df["latitude"],
            errors="coerce"
        )

        map_df["longitude"] = pd.to_numeric(
            map_df["longitude"],
            errors="coerce"
        )


        map_df = map_df.dropna(
            subset=[
                "latitude",
                "longitude"
            ]
        )


        # ----------------------------------------------------
        # KEEP ONLY VALID GEOGRAPHIC LOCATIONS
        # ----------------------------------------------------

        map_df = map_df[
            (map_df["latitude"] >= -90)
            &
            (map_df["latitude"] <= 90)
            &
            (map_df["longitude"] >= -180)
            &
            (map_df["longitude"] <= 180)
        ]


        # ----------------------------------------------------
        # REDUCE MAP SIZE
        # ----------------------------------------------------

        MAX_MAP_POINTS = 8000


        if len(map_df) > MAX_MAP_POINTS:

            # Prefer high-risk observations

            map_df = (
                map_df
                .sort_values(
                    "Bloom Risk Probability",
                    ascending=False
                )
                .head(
                    MAX_MAP_POINTS
                )
            )


        # ====================================================
        # INTERACTIVE MAP
        # ====================================================

        import plotly.express as px


        fig = px.scatter_map(

            map_df,

            lat="latitude",

            lon="longitude",

            color="Bloom Risk Probability",

            color_continuous_scale=[
                [0.0, "green"],
                [0.35, "yellowgreen"],
                [0.60, "yellow"],
                [0.80, "orange"],
                [1.0, "red"]
            ],

            hover_data={

                "latitude":
                    ":.6f",

                "longitude":
                    ":.6f",

                "Bloom Risk Probability":
                    ":.4f"
            },

            zoom=4,

            height=600
        )


        fig.update_layout(

            map_style="open-street-map",

            margin={
                "r": 0,
                "t": 0,
                "l": 0,
                "b": 0
            },

            coloraxis_colorbar={

                "title":
                    "Bloom Risk Probability"
            }
        )


        st.plotly_chart(

            fig,

            use_container_width=True
        )


        # ====================================================
        # HOTSPOT TABLE
        # ====================================================

        st.subheader(
            "🔥 Highest-Risk Historical Locations"
        )


        hotspot_columns = [

            "latitude",

            "longitude",

            "Bloom Risk Probability"
        ]


        hotspot_table = (

            map_df[
                hotspot_columns
            ]

            .sort_values(
                "Bloom Risk Probability",
                ascending=False
            )

            .head(20)

            .reset_index(
                drop=True
            )
        )


        st.dataframe(

            hotspot_table,

            use_container_width=True,

            hide_index=True
        )


    else:

        st.warning(
            "Historical dataset does not contain "
            "latitude and longitude columns required "
            "for hotspot mapping."
        )


else:

    st.warning(
        "Historical prediction dataset could not "
        "be loaded."
    )