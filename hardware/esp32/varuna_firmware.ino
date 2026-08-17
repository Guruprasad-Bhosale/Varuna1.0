#include <Arduino.h>

// PIN DEFINITIONS
#define PIN_PH_SENSOR      36 // ADC1_CH0
#define PIN_TURBIDITY      39 // ADC1_CH3
#define PIN_EC_SENSOR      34 // ADC1_CH6
#define PIN_TEMP_SENSOR    32 // DS18B20 1-Wire
#define PIN_FLOAT_SWITCH   25 // Digital In with Pullup
#define PIN_PUMP_RELAY     26 // Digital Out
#define PIN_DRAIN_RELAY    27 // Digital Out

// STATE MACHINE
enum NodeState {
    STATE_IDLE,
    STATE_PUMPING,
    STATE_STABILIZING,
    STATE_SAMPLE,
    STATE_DRAIN
};

NodeState currentState = STATE_IDLE;
unsigned long stateStartTime = 0;

// TIMING CONSTANTS (ms)
const unsigned long PUMP_DURATION = 10000;
const unsigned long STABILIZE_DURATION = 15000;
const unsigned long DRAIN_DURATION = 10000;
const unsigned long IDLE_DURATION = 60000; // 1 min (Controlled by master in real deployment, but autonomous here)

// SENSOR VARIABLES
float current_ph = 0.0;
float current_turbidity = 0.0;
float current_ec = 0.0;
float current_temp = 25.0;
bool chamber_full = false;

// MOCK CALIBRATION VALUES
const float PH_CAL_SLOPE = -5.70;
const float PH_CAL_INTERCEPT = 21.34;

void setup() {
    Serial.begin(115200);
    
    pinMode(PIN_PH_SENSOR, INPUT);
    pinMode(PIN_TURBIDITY, INPUT);
    pinMode(PIN_EC_SENSOR, INPUT);
    pinMode(PIN_TEMP_SENSOR, INPUT);
    pinMode(PIN_FLOAT_SWITCH, INPUT_PULLUP);
    
    pinMode(PIN_PUMP_RELAY, OUTPUT);
    pinMode(PIN_DRAIN_RELAY, OUTPUT);
    
    digitalWrite(PIN_PUMP_RELAY, LOW);
    digitalWrite(PIN_DRAIN_RELAY, LOW);
    
    // Simulate initialization delay
    delay(2000);
    Serial.println("{\"event\": \"boot_complete\", \"device\": \"VARUNA-ESP32-01\"}");
    stateStartTime = millis();
}

float readPH() {
    int adcValue = analogRead(PIN_PH_SENSOR);
    float voltage = (adcValue / 4095.0) * 3.3;
    float ph = (PH_CAL_SLOPE * voltage) + PH_CAL_INTERCEPT;
    // Add realistic jitter
    ph += ((random(-10, 10)) / 100.0);
    return constrain(ph, 0.0, 14.0);
}

float readTurbidity() {
    int adcValue = analogRead(PIN_TURBIDITY);
    float voltage = (adcValue / 4095.0) * 3.3;
    // Formula approximation (0 NTU at ~3.3V, 3000 NTU at ~0V)
    float ntu = -1120.4 * square(voltage) + 5742.3 * voltage - 4352.9;
    if (ntu < 0) ntu = 0;
    ntu += ((random(-20, 20)) / 10.0);
    return ntu;
}

float readEC(float temp) {
    int adcValue = analogRead(PIN_EC_SENSOR);
    float voltage = (adcValue / 4095.0) * 3.3;
    // Basic temperature compensated EC approximation
    float ec = (133.42 * voltage * voltage * voltage - 255.86 * voltage * voltage + 857.39 * voltage) * 1.0;
    float tempCoef = 1.0 + 0.02 * (temp - 25.0);
    ec = ec / tempCoef;
    ec += random(-10, 10);
    return max(0.0f, ec);
}

float readTemperature() {
    // DS18B20 mockup for simplicity without OneWire library
    // In actual HW: sensors.requestTemperatures(); return sensors.getTempCByIndex(0);
    float baseTemp = 25.5;
    return baseTemp + ((random(-50, 50)) / 100.0);
}

void emitJSONPayload() {
    String json = "{";
    json += "\"ph\":" + String(current_ph, 2) + ",";
    json += "\"turbidity_ntu\":" + String(current_turbidity, 2) + ",";
    json += "\"ec_us_cm\":" + String(current_ec, 2) + ",";
    json += "\"temperature_c\":" + String(current_temp, 2) + ",";
    json += "\"level_ok\":" + String(chamber_full ? "false" : "true");
    json += "}";
    Serial.println(json); // Newline acts as frame marker
}

void loop() {
    unsigned long now = millis();
    chamber_full = (digitalRead(PIN_FLOAT_SWITCH) == LOW); // Assuming LOW = Float triggered
    
    switch (currentState) {
        case STATE_IDLE:
            if (now - stateStartTime >= IDLE_DURATION) {
                currentState = STATE_PUMPING;
                digitalWrite(PIN_PUMP_RELAY, HIGH);
                stateStartTime = now;
            }
            break;
            
        case STATE_PUMPING:
            // Safety float switch check
            if (chamber_full || (now - stateStartTime >= PUMP_DURATION)) {
                digitalWrite(PIN_PUMP_RELAY, LOW);
                currentState = STATE_STABILIZING;
                stateStartTime = now;
            }
            break;
            
        case STATE_STABILIZING:
            if (now - stateStartTime >= STABILIZE_DURATION) {
                currentState = STATE_SAMPLE;
                stateStartTime = now;
            }
            break;
            
        case STATE_SAMPLE:
            current_temp = readTemperature();
            current_ph = readPH();
            current_turbidity = readTurbidity();
            current_ec = readEC(current_temp);
            
            emitJSONPayload();
            
            currentState = STATE_DRAIN;
            digitalWrite(PIN_DRAIN_RELAY, HIGH);
            stateStartTime = now;
            break;
            
        case STATE_DRAIN:
            if (now - stateStartTime >= DRAIN_DURATION) {
                digitalWrite(PIN_DRAIN_RELAY, LOW);
                currentState = STATE_IDLE;
                stateStartTime = now;
            }
            break;
    }
}
