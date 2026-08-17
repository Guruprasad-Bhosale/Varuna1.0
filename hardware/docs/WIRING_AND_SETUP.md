# Project VARUNA — Hardware Wiring & Flashing Guide

This guide provides explicit instructions for wiring the ESP32 to the sensor suite and the edge orchestrator (Raspberry Pi), along with firmware flashing and sensor calibration procedures.

## 1. Pinout & Electrical Wiring Table

The ESP32 acts as the analog acquisition frontend. Ensure all devices share a **Common Ground**. 
**WARNING:** The 12V peristaltic pump requires an isolated relay and flyback diode to prevent inductive kickback from destroying the ESP32.

| Component | Pin / Terminal | ESP32 Connection | Power Requirement | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Analog pH Sensor** | Signal (PO) | `GPIO 36` (ADC1_CH0) | 5V DC | Connect via 5V logic level shifter if 3.3V ADC max is exceeded. |
| **Turbidity Sensor** | Signal (OUT) | `GPIO 39` (ADC1_CH3) | 5V DC | Outputs 0-4.5V. **CRITICAL:** Use a voltage divider (10k/20k) to step down to max 3.3V. |
| **Analog EC / TDS** | Signal | `GPIO 34` (ADC1_CH6) | 3.3V or 5V DC | Ensure probe is isolated from pump chassis ground to prevent ground loops. |
| **DS18B20 Temp** | Data (DQ) | `GPIO 32` | 3.3V DC | Requires a **4.7kΩ Pull-Up Resistor** between DQ and 3.3V. |
| **Float Switch** | Signal | `GPIO 25` | 3.3V DC | Internal Pullup enabled in firmware. |
| **5V Relay (Pump)** | IN / Signal | `GPIO 26` | 5V DC (Coil) | Switch isolates 12V 2A power supply for the peristaltic pump. |
| **5V Relay (Drain)** | IN / Signal | `GPIO 27` | 5V DC (Coil) | Switch isolates 12V solenoid drain valve. |
| **Raspberry Pi 4** | USB or UART | `TX/RX` / USB-C | 5V (USB) | Sends JSON telemetry packets over 115200 baud. |

### ASCII Wiring Schematic (Pump Relay Isolation)
```text
[ESP32 GPIO 26] -----> [Relay IN]
[ESP32 GND] ---------> [Relay GND]
[ESP32 5V/VIN] ------> [Relay VCC]

[12V Power Supply +] -> [Relay COM]
[Relay NO] -----------> [Pump Positive Terminal]
[12V Power Supply -] -> [Pump Negative Terminal]
```
*Note: Place a 1N4007 flyback diode across the pump terminals (Cathode to Positive) to suppress inductive spikes.*

---

## 2. Firmware Flashing Guide

1. **Install PlatformIO** (VS Code Extension) or **Arduino IDE**.
2. **Board Configuration**: Select `DOIT ESP32 DEVKIT V1`.
3. **Library Dependencies**: Install the following libraries:
   - `ArduinoJson` (by Benoit Blanchon)
   - `OneWire` (by Paul Stoffregen)
   - `DallasTemperature` (by Miles Burton)
4. **Flashing**:
   - Connect the ESP32 to your PC via micro-USB.
   - Open `hardware/esp32/varuna_firmware.ino`.
   - Set Baud Rate to `115200`.
   - Compile and Upload. (You may need to hold the `BOOT` button on the ESP32 when the console shows `Connecting...`).

---

## 3. Sensor Calibration Procedures

Before field deployment, the sensors must be calibrated against standard solutions.

### pH Calibration
1. Rinse the pH probe in distilled water.
2. Submerge in **pH 4.0** buffer solution. Record the raw ADC voltage.
3. Rinse in distilled water, then submerge in **pH 7.0** buffer solution. Record the raw ADC voltage.
4. Calculate the slope and intercept for the linear equation `pH = (Slope * Voltage) + Intercept`.
5. Update `PH_CAL_SLOPE` and `PH_CAL_INTERCEPT` constants in `varuna_firmware.ino`.

### Electrical Conductivity (EC) Calibration
1. Submerge the EC probe in a **1413 µS/cm** standard calibration solution.
2. Read the raw analog voltage and ambient temperature (from DS18B20).
3. Adjust the polynomial coefficients or linear multiplier in the `readEC(float temp)` function to match 1413 µS/cm.
