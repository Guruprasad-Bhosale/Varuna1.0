import streamlit as st
import pandas as pd
import numpy as np
import joblib
import plotly.express as px
from pathlib import Path
from datetime import datetime


# ============================================================
# PAGE CONFIG
# ============================================================

st.set_page_config(
    page_title="NIRVAAH | Ocean Risk Intelligence",
    page_icon="🌊",
    layout="wide",
    initial_sidebar_state="expanded"
)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data" / "processed"

MODEL_PATH = DATA_DIR / "nirvaah_xgboost.joblib"

PREDICTION_PATH = DATA_DIR / "nirvaah_final_predictions.parquet"

HOTSPOT_PATH = DATA_DIR / "nirvaah_final_hotspots.parquet"


# ============================================================
# CUSTOM CSS
# ============================================================

st.markdown("""
<style>

.main {
    background-color: #071522;
}

.block-container {
    padding-top: 1.5rem;
    padding-bottom: 2rem;
}

.hero {
    padding: 25px;
    border-radius: 18px;
    background: linear-gradient(135deg, #06283D, #1363DF);
    color: white;
    margin-bottom: 20px;
}

.hero h1 {
    font-size: 42px;
    margin-bottom: 5px;
}

.hero p {
    font-size: 18px;
    opacity: 0.9;
}

.metric-card {
    background: #101d2b;
    padding: 20px;
    border-radius: 15px;
    border: 1px solid #23384d;
}

.risk-low {
    padding: 20px;
    border-radius: 15px;
    background: #073b2a;
    border: 2px solid #20c997;
    color: white;
    text-align: center;
}

.risk-moderate {
    padding: 20px;
    border-radius: 15px;
    background: #493a05;
    border: 2px solid #ffc107;
    color: white;
    text-align: center;
}

.risk-high {
    padding: 20px;
    border-radius: 15px;
    background: #542000;
    border: 2px solid #ff8c00;
    color: white;
    text-align: center;
}

.risk-very-high {
    padding: 20px;
    border-radius: 15px;
    background: #4d0710;
    border: 2px solid #ff304f;
    color: white;
    text-align: center;
}

.sensor-box {
    padding: 15px;
    border-radius: 12px;
    background: #0d1b29;
    border: 1px solid #263b50;
}

</style>
""", unsafe_allow_html=True)


# ============================================================
# MODEL
# ============================================================

@st.cache_resource
def load_model():

    if not MODEL_PATH.exists():
        return None

    return joblib.load(MODEL_PATH)


model = load_model()


# ============================================================
# LOAD HISTORICAL DATA
# ============================================================

@st.cache_data
def load_predictions():

    if PREDICTION_PATH.exists():

        try:
            return pd.read_parquet(PREDICTION_PATH)

        except Exception:
            return pd.DataFrame()

    return pd.DataFrame()


@st.cache_data
def load_hotspots():

    if HOTSPOT_PATH.exists():

        try:
            return pd.read_parquet(HOTSPOT_PATH)

        except Exception:
            return pd.DataFrame()

    return pd.DataFrame()


prediction_df = load_predictions()
hotspot_df = load_hotspots()


# ============================================================
# HERO
# ============================================================

st.markdown("""
<div class="hero">

<h1>🌊 NIRVAAH</h1>

<p>
AI-Powered Ocean Intelligence & Environmental Risk Platform
</p>

<p>
🛰️ Satellite Data &nbsp; | &nbsp;
🤖 Machine Learning &nbsp; | &nbsp;
🌊 Ocean Monitoring &nbsp; | &nbsp;
🚨 Environmental Risk Intelligence
</p>

</div>
""", unsafe_allow_html=True)


# ============================================================
# SIDEBAR
# ============================================================

st.sidebar.title("🌊 NIRVAAH")

page = st.sidebar.radio(
    "Navigation",
    [
        "🚨 Live AI Prediction",
        "🗺️ Risk Hotspots",
        "📊 System Analytics",
        "ℹ️ About NIRVAAH"
    ]
)


if model is None:

    st.error(
        f"XGBoost model not found:\n\n{MODEL_PATH}"
    )

    st.stop()


# ============================================================
# FEATURE ENGINEERING
# ============================================================

def create_features(
    chl,
    kd490,
    tsm,
    wave_height,
    latitude,
    longitude,
    month,
    day_of_year,
    year,
    baseline
):

    # --------------------------------------------------------
    # Saturation
    # --------------------------------------------------------

    chl_saturated = int(chl >= baseline["chl_sat"])
    kd490_saturated = int(kd490 >= baseline["kd490_sat"])
    tsm_saturated = int(tsm >= baseline["tsm_sat"])

    has_saturation = int(
        chl_saturated or
        kd490_saturated or
        tsm_saturated
    )

    # --------------------------------------------------------
    # Log transforms
    # --------------------------------------------------------

    log_chl = np.log1p(max(chl, 0))
    log_kd490 = np.log1p(max(kd490, 0))
    log_tsm = np.log1p(max(tsm, 0))

    # --------------------------------------------------------
    # Ratio
    # --------------------------------------------------------

    chl_tsm_ratio = chl / (tsm + 1e-6)

    # --------------------------------------------------------
    # Z scores
    # --------------------------------------------------------

    chl_z = (
        (chl - baseline["chl_mean"])
        / baseline["chl_std"]
    )

    kd490_z = (
        (kd490 - baseline["kd490_mean"])
        / baseline["kd490_std"]
    )

    tsm_z = (
        (tsm - baseline["tsm_mean"])
        / baseline["tsm_std"]
    )

    # --------------------------------------------------------
    # Feature vector
    # --------------------------------------------------------

    features = {

        "chl": chl,
        "kd490": kd490,
        "tsm": tsm,
        "wave_height": wave_height,

        "latitude": latitude,
        "longitude": longitude,

        "month": month,
        "day_of_year": day_of_year,
        "year": year,

        # Numeric seasonal encoding
        "season": ((month % 12) // 3),

        "chl_saturated": chl_saturated,
        "kd490_saturated": kd490_saturated,
        "tsm_saturated": tsm_saturated,

        "log_chl": log_chl,
        "log_kd490": log_kd490,
        "log_tsm": log_tsm,

        "chl_tsm_ratio": chl_tsm_ratio,

        "has_saturation": has_saturation,

        "chl_mean": baseline["chl_mean"],
        "chl_std": baseline["chl_std"],

        "kd490_mean": baseline["kd490_mean"],
        "kd490_std": baseline["kd490_std"],

        "tsm_mean": baseline["tsm_mean"],
        "tsm_std": baseline["tsm_std"],

        "chl_z": chl_z,
        "kd490_z": kd490_z,
        "tsm_z": tsm_z
    }

    return pd.DataFrame([features])


# ============================================================
# BASELINE
# ============================================================

# These are derived from the historical NIRVAAH dataset.
# They provide a stable reference for live sensor inference.

BASELINE = {

    "chl_mean": 0.65,
    "chl_std": 0.35,

    "kd490_mean": 0.09,
    "kd490_std": 0.04,

    "tsm_mean": 12.0,
    "tsm_std": 7.0,

    # conservative saturation thresholds
    "chl_sat": 50.0,
    "kd490_sat": 5.0,
    "tsm_sat": 100.0
}


# ============================================================
# RISK ENGINE
# ============================================================

def calculate_risk(
    bloom_probability,
    ph,
    turbidity,
    ec,
    temperature_anomaly
):

    # --------------------------------------------------------
    # ML risk
    # --------------------------------------------------------

    if bloom_probability >= 0.90:

        ml_risk = "VERY HIGH"

    elif bloom_probability >= 0.80:

        ml_risk = "HIGH"

    elif bloom_probability >= 0.50:

        ml_risk = "MODERATE"

    else:

        ml_risk = "LOW"


    # --------------------------------------------------------
    # Environmental score
    # --------------------------------------------------------

    score = 0
    reasons = []


    # pH

    if ph < 6.0 or ph > 9.0:

        score += 2

        reasons.append(
            f"pH anomaly ({ph:.2f})"
        )

    elif ph < 6.5 or ph > 8.5:

        score += 1

        reasons.append(
            f"pH warning ({ph:.2f})"
        )


    # Turbidity

    if turbidity > 30:

        score += 2

        reasons.append(
            f"Elevated turbidity ({turbidity:.1f} NTU)"
        )

    elif turbidity >= 10:

        score += 1

        reasons.append(
            f"Turbidity warning ({turbidity:.1f} NTU)"
        )


    # EC

    if ec > 1200:

        score += 2

        reasons.append(
            f"Electrical conductivity anomaly ({ec:.0f} µS/cm)"
        )

    elif ec > 700:

        score += 1

        reasons.append(
            f"Electrical conductivity warning ({ec:.0f} µS/cm)"
        )


    # Temperature

    if abs(temperature_anomaly) >= 3:

        score += 2

        reasons.append(
            f"Temperature anomaly ({temperature_anomaly:+.1f}°C)"
        )

    elif abs(temperature_anomaly) >= 1:

        score += 1

        reasons.append(
            f"Temperature warning ({temperature_anomaly:+.1f}°C)"
        )


    # --------------------------------------------------------
    # Final risk
    # --------------------------------------------------------

    if bloom_probability >= 0.90 or score >= 6:

        final_risk = "VERY HIGH"

    elif bloom_probability >= 0.80 or score >= 4:

        final_risk = "HIGH"

    elif bloom_probability >= 0.50 or score >= 2:

        final_risk = "MODERATE"

    else:

        final_risk = "LOW"


    if bloom_probability >= 0.80:

        reasons.insert(
            0,
            f"High ML bloom-risk probability ({bloom_probability:.3f})"
        )

    if not reasons:

        reasons.append(
            "No significant environmental or ML risk signals detected."
        )


    # --------------------------------------------------------
    # Recommendation
    # --------------------------------------------------------

    recommendations = {

        "VERY HIGH":
        "🚨 Restrict fishing in the affected area and initiate immediate environmental investigation.",

        "HIGH":
        "⚠️ Issue an environmental warning and increase monitoring frequency.",

        "MODERATE":
        "🟠 Continue monitoring and collect additional observations.",

        "LOW":
        "🟢 Conditions currently indicate low environmental risk."
    }


    return {

        "ml_risk": ml_risk,
        "final_risk": final_risk,
        "environmental_score": score,
        "reasons": reasons,
        "recommendation": recommendations[final_risk]
    }


# ============================================================
# PAGE 1 — LIVE AI PREDICTION
# ============================================================

if page == "🚨 Live AI Prediction":

    st.header("🚨 Live NIRVAAH AI Risk Prediction")

    st.write(
        "Enter real-time satellite/IoT observations. "
        "NIRVAAH automatically engineers the ML features "
        "and runs the trained XGBoost model."
    )


    # --------------------------------------------------------
    # SENSOR INPUT
    # --------------------------------------------------------

    st.subheader("🛰️ Ocean Observation Inputs")

    col1, col2, col3, col4 = st.columns(4)


    with col1:

        chl = st.number_input(
            "Chlorophyll-a (CHL)",
            min_value=0.0,
            value=1.0,
            step=0.01
        )

        kd490 = st.number_input(
            "KD490",
            min_value=0.0,
            value=0.10,
            step=0.01
        )


    with col2:

        tsm = st.number_input(
            "TSM",
            min_value=0.0,
            value=12.0,
            step=0.1
        )

        wave_height = st.number_input(
            "Wave Height (m)",
            min_value=0.0,
            value=1.0,
            step=0.1
        )


    with col3:

        latitude = st.number_input(
            "Latitude",
            value=18.50,
            format="%.6f"
        )

        longitude = st.number_input(
            "Longitude",
            value=73.00,
            format="%.6f"
        )


    with col4:

        ph = st.number_input(
            "pH",
            min_value=0.0,
            max_value=14.0,
            value=7.4,
            step=0.1
        )

        turbidity = st.number_input(
            "Turbidity (NTU)",
            min_value=0.0,
            value=5.0,
            step=1.0
        )


    st.subheader("🌡️ Environmental Sensors")

    col1, col2 = st.columns(2)


    with col1:

        ec = st.number_input(
            "Electrical Conductivity (µS/cm)",
            min_value=0.0,
            value=520.0,
            step=10.0
        )


    with col2:

        temperature_anomaly = st.number_input(
            "Temperature Anomaly (°C)",
            value=0.4,
            step=0.1
        )


    # --------------------------------------------------------
    # DATE
    # --------------------------------------------------------

    now = datetime.now()

    month = now.month

    day_of_year = now.timetuple().tm_yday

    year = now.year


    # --------------------------------------------------------
    # PREDICT
    # --------------------------------------------------------

    st.markdown("---")

    predict = st.button(
        "🚀 ANALYZE WITH NIRVAAH AI",
        use_container_width=True,
        type="primary"
    )


    if predict:

        with st.spinner(
            "NIRVAAH AI is analyzing ocean conditions..."
        ):

            X_live = create_features(

                chl=chl,
                kd490=kd490,
                tsm=tsm,
                wave_height=wave_height,

                latitude=latitude,
                longitude=longitude,

                month=month,
                day_of_year=day_of_year,
                year=year,

                baseline=BASELINE
            )


            # ------------------------------------------------
            # XGBOOST
            # ------------------------------------------------

            try:

                bloom_probability = float(
                    model.predict_proba(X_live)[0, 1]
                )

            except Exception as e:

                st.error(
                    f"XGBoost prediction error: {e}"
                )

                st.stop()


            # ------------------------------------------------
            # RISK ENGINE
            # ------------------------------------------------

            result = calculate_risk(

                bloom_probability=bloom_probability,

                ph=ph,
                turbidity=turbidity,
                ec=ec,
                temperature_anomaly=temperature_anomaly
            )


        # ====================================================
        # RESULTS
        # ====================================================

        st.success(
            "NIRVAAH analysis completed successfully."
        )


        st.subheader("🧠 AI Prediction")


        col1, col2, col3 = st.columns(3)


        with col1:

            st.metric(
                "Bloom Probability",
                f"{bloom_probability:.2%}"
            )


        with col2:

            st.metric(
                "ML Risk",
                result["ml_risk"]
            )


        with col3:

            st.metric(
                "Environmental Score",
                result["environmental_score"]
            )


        # ----------------------------------------------------
        # FINAL RISK
        # ----------------------------------------------------

        risk = result["final_risk"]


        if risk == "LOW":

            st.markdown(
                f"""
                <div class="risk-low">
                    <h1>🟢 LOW RISK</h1>
                    <h3>NIRVAAH Final Decision</h3>
                </div>
                """,
                unsafe_allow_html=True
            )


        elif risk == "MODERATE":

            st.markdown(
                f"""
                <div class="risk-moderate">
                    <h1>🟠 MODERATE RISK</h1>
                    <h3>NIRVAAH Final Decision</h3>
                </div>
                """,
                unsafe_allow_html=True
            )


        elif risk == "HIGH":

            st.markdown(
                f"""
                <div class="risk-high">
                    <h1>🔴 HIGH RISK</h1>
                    <h3>NIRVAAH Final Decision</h3>
                </div>
                """,
                unsafe_allow_html=True
            )


        else:

            st.markdown(
                f"""
                <div class="risk-very-high">
                    <h1>🚨 VERY HIGH RISK</h1>
                    <h3>NIRVAAH Final Decision</h3>
                </div>
                """,
                unsafe_allow_html=True
            )


        # ----------------------------------------------------
        # REASONS
        # ----------------------------------------------------

        st.subheader("🔍 Why did NIRVAAH give this result?")


        for reason in result["reasons"]:

            st.write(
                f"• {reason}"
            )


        st.subheader("🎯 Recommended Action")


        st.info(
            result["recommendation"]
        )


        # ----------------------------------------------------
        # INPUT SUMMARY
        # ----------------------------------------------------

        st.subheader("📡 Sensor Data Received")


        sensor_df = pd.DataFrame({

            "Parameter": [

                "Chlorophyll-a",
                "KD490",
                "TSM",
                "Wave Height",
                "pH",
                "Turbidity",
                "EC",
                "Temperature Anomaly",
                "Latitude",
                "Longitude"
            ],

            "Value": [

                chl,
                kd490,
                tsm,
                wave_height,
                ph,
                turbidity,
                ec,
                temperature_anomaly,
                latitude,
                longitude
            ]
        })


        st.dataframe(
            sensor_df,
            use_container_width=True,
            hide_index=True
        )


        # ----------------------------------------------------
        # PROBABILITY GAUGE
        # ----------------------------------------------------

        gauge = pd.DataFrame({

            "Risk": ["Bloom Risk"],

            "Probability": [
                bloom_probability
            ]
        })


        fig = px.bar(

            gauge,

            x="Risk",

            y="Probability",

            range_y=[0, 1],

            text_auto=".1%",

            title="AI Bloom-Risk Probability"
        )


        fig.update_layout(

            height=350,

            yaxis_title="Probability",

            xaxis_title=""
        )


        st.plotly_chart(
            fig,
            use_container_width=True
        )


# ============================================================
# PAGE 2 — HOTSPOTS
# ============================================================

elif page == "🗺️ Risk Hotspots":

    st.header("🗺️ NIRVAAH AI Risk Hotspots")


    if hotspot_df.empty:

        st.warning(
            "Hotspot dataset unavailable."
        )

    else:

        st.write(
            "Spatial distribution of AI-predicted bloom risk."
        )


        # ----------------------------------------------------
        # Detect columns
        # ----------------------------------------------------

        lat_col = next(
            (
                c for c in hotspot_df.columns
                if c.lower() == "latitude"
            ),
            None
        )

        lon_col = next(
            (
                c for c in hotspot_df.columns
                if c.lower() == "longitude"
            ),
            None
        )


        prob_col = next(
            (
                c for c in hotspot_df.columns
                if "probability" in c.lower()
            ),
            None
        )


        if lat_col and lon_col:

            map_df = hotspot_df.copy()

            if prob_col:

                map_df["Risk Probability"] = map_df[
                    prob_col
                ]

                fig = px.scatter_mapbox(

                    map_df,

                    lat=lat_col,

                    lon=lon_col,

                    color="Risk Probability",

                    color_continuous_scale="RdYlGn_r",

                    zoom=5,

                    height=650,

                    hover_data=map_df.columns
                )

            else:

                fig = px.scatter_mapbox(

                    map_df,

                    lat=lat_col,

                    lon=lon_col,

                    zoom=5,

                    height=650
                )


            fig.update_layout(
                mapbox_style="open-street-map"
            )


            st.plotly_chart(
                fig,
                use_container_width=True
            )


        st.subheader("🔥 Highest Risk Locations")


        st.dataframe(
            hotspot_df.head(20),
            use_container_width=True,
            hide_index=True
        )


# ============================================================
# PAGE 3 — ANALYTICS
# ============================================================

elif page == "📊 System Analytics":

    st.header("📊 NIRVAAH System Analytics")


    if prediction_df.empty:

        st.warning(
            "Prediction dataset unavailable."
        )

    else:

        st.metric(
            "Total AI Observations",
            f"{len(prediction_df):,}"
        )


        # Find probability column

        probability_column = next(
            (
                c for c in prediction_df.columns
                if "probability" in c.lower()
            ),
            None
        )


        if probability_column:

            fig = px.histogram(

                prediction_df,

                x=probability_column,

                nbins=50,

                title="AI Bloom-Risk Probability Distribution"
            )

            st.plotly_chart(
                fig,
                use_container_width=True
            )


        st.subheader("📋 Prediction Data")

        st.dataframe(
            prediction_df.head(100),
            use_container_width=True,
            hide_index=True
        )


# ============================================================
# PAGE 4 — ABOUT
# ============================================================

elif page == "ℹ️ About NIRVAAH":

    st.header("🌊 About NIRVAAH")


    st.markdown("""
    ## NIRVAAH

    **NIRVAAH — Ocean Intelligence & Environmental Risk Platform**

    NIRVAAH combines:

    🛰️ **Satellite Ocean Observation**

    🤖 **Machine Learning**

    🌊 **Environmental Sensor Intelligence**

    📍 **Spatial Risk Analysis**

    🚨 **Early Warning**

    ### AI Pipeline

    ```text
    Satellite / Sensor Data
            ↓
    Feature Engineering
            ↓
    XGBoost Bloom Prediction
            ↓
    Bloom Probability
            ↓
    Environmental Risk Engine
            ↓
    Spatial Hotspot Detection
            ↓
    NIRVAAH Final Risk
            ↓
    Recommended Action
    ```

    ### Current ML Model

    **XGBoost**

    The trained model uses 27 engineered oceanographic
    features including Chlorophyll-a, KD490, TSM,
    wave height, spatial coordinates, temporal features,
    logarithmic transformations, ratios and anomaly
    features.

    ### Decision Intelligence

    NIRVAAH does not depend only on the ML prediction.

    It combines:

    **AI Bloom Risk + Environmental Signals**

    to generate a final environmental risk assessment.
    """)


    # ============================================================
# HISTORICAL MODEL EVIDENCE
# ============================================================

st.markdown("---")

st.header("📚 Historical Intelligence — Data Behind NIRVAAH")

st.write(
    "NIRVAAH's AI predictions are supported by historical "
    "ocean observations used during model development and "
    "spatial hotspot analysis."
)

# ------------------------------------------------------------
# MODEL / DATA SUMMARY
# ------------------------------------------------------------

col1, col2, col3, col4, col5 = st.columns(5)

with col1:
    st.metric(
        "🌊 Historical Observations",
        "4.5M+"
    )

with col2:
    st.metric(
        "📍 Spatial Locations",
        "5,438"
    )

with col3:
    st.metric(
        "🧠 ML Features",
        "27"
    )

with col4:
    st.metric(
        "🤖 Model",
        "XGBoost"
    )

with col5:
    st.metric(
        "📅 Training Period",
        "2017–2019"
    )


# ------------------------------------------------------------
# TRAINING DATASET
# ------------------------------------------------------------

st.subheader("🧬 Historical Dataset Used by NIRVAAH")

dataset_info = pd.DataFrame({

    "Component": [
        "Ocean observations",
        "Training period",
        "Testing period",
        "Spatial locations",
        "ML features",
        "Primary optical variables",
        "Environmental variables",
        "Prediction target"
    ],

    "NIRVAAH Data": [
        "4,505,735",
        "2017 – 2019",
        "2020",
        "5,438",
        "27",
        "CHL, KD490, TSM",
        "Wave height + spatial/temporal features",
        "Bloom Risk Proxy"
    ]
})

st.dataframe(
    dataset_info,
    use_container_width=True,
    hide_index=True
)


# ------------------------------------------------------------
# HISTORICAL HOTSPOTS
# ------------------------------------------------------------

st.subheader("🔥 Historical AI-Predicted Bloom Hotspots")

if not hotspot_df.empty:

    hist = hotspot_df.copy()

    lat_col = next(
        (
            c for c in hist.columns
            if c.lower() == "latitude"
        ),
        None
    )

    lon_col = next(
        (
            c for c in hist.columns
            if c.lower() == "longitude"
        ),
        None
    )

    prob_col = next(
        (
            c for c in hist.columns
            if "mean_bloom_probability" in c.lower()
        ),
        None
    )

    if lat_col and lon_col:

        st.write(
            "Locations below represent spatial cells where "
            "NIRVAAH identified elevated historical bloom-risk."
        )

        # ----------------------------------------------------
        # MAP
        # ----------------------------------------------------

        if prob_col:

            map_data = hist.copy()

            map_data["Bloom Risk Probability"] = (
                map_data[prob_col]
            )

            fig_hist = px.scatter_mapbox(

                map_data,

                lat=lat_col,

                lon=lon_col,

                color="Bloom Risk Probability",

                color_continuous_scale="RdYlGn_r",

                zoom=4.5,

                height=600,

                hover_data=[
                    lat_col,
                    lon_col,
                    prob_col
                ]
            )

        else:

            fig_hist = px.scatter_mapbox(

                hist,

                lat=lat_col,

                lon=lon_col,

                zoom=4.5,

                height=600
            )

        fig_hist.update_layout(
            mapbox_style="open-street-map"
        )

        st.plotly_chart(
            fig_hist,
            use_container_width=True
        )


        # ----------------------------------------------------
        # TOP LOCATIONS
        # ----------------------------------------------------

        st.subheader("📍 Top Historical Risk Locations")

        display_columns = [

            c for c in [

                "latitude",
                "longitude",
                "mean_bloom_probability",
                "max_bloom_probability",
                "high_risk_fraction",
                "high_risk_percentage",
                "observations",
                "risk_category"

            ]

            if c in hist.columns
        ]

        if display_columns:

            top_locations = (
                hist
                .sort_values(
                    by=(
                        "mean_bloom_probability"
                        if "mean_bloom_probability"
                        in hist.columns
                        else display_columns[0]
                    ),
                    ascending=False
                )
                .head(20)
            )

            st.dataframe(
                top_locations[display_columns],
                use_container_width=True,
                hide_index=True
            )


# ------------------------------------------------------------
# HISTORICAL PROBABILITY DISTRIBUTION
# ------------------------------------------------------------

if not prediction_df.empty:

    probability_column = next(
        (
            c for c in prediction_df.columns
            if "probability" in c.lower()
        ),
        None
    )

    if probability_column:

        st.subheader(
            "📈 Historical Bloom-Risk Probability Distribution"
        )

        fig_probability = px.histogram(

            prediction_df,

            x=probability_column,

            nbins=50,

            title="NIRVAAH Historical AI Risk Distribution"
        )

        fig_probability.update_layout(
            xaxis_title="Bloom Risk Probability",
            yaxis_title="Observations"
        )

        st.plotly_chart(
            fig_probability,
            use_container_width=True
        )


# ------------------------------------------------------------
# DATASET TRANSPARENCY
# ------------------------------------------------------------

st.info(
    "💡 NIRVAAH separates historical model evidence "
    "from live sensor inference. Historical observations "
    "provide the basis for model development, while the "
    "Live AI Prediction module accepts new environmental "
    "observations and generates a fresh risk assessment."
)