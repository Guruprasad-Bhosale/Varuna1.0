import serial
import json
import time
import logging
import random
from typing import Optional, Dict, Any
import threading

logger = logging.getLogger("VARUNA-SERIAL")

class SerialReader:
    def __init__(self, port: str = '/dev/ttyUSB0', baudrate: int = 115200, hw_mode: bool = False):
        self.port = port
        self.baudrate = baudrate
        self.hw_mode = hw_mode
        self.ser = None
        self._lock = threading.Lock()
        
        if self.hw_mode:
            self._connect()
            
    def _connect(self):
        try:
            self.ser = serial.Serial(self.port, self.baudrate, timeout=5)
            logger.info(f"Connected to ESP32 on {self.port} at {self.baudrate} baud.")
        except serial.SerialException as e:
            logger.error(f"Failed to connect to ESP32: {e}")
            self.ser = None
            
    def _read_mock(self) -> Dict[str, Any]:
        """Generate a realistic mock JSON payload"""
        time.sleep(1) # Simulate sampling time
        ph = 6.5 + (random.random() * 2.0)
        turb = 5.0 + (random.random() * 20.0)
        ec = 400 + (random.random() * 200)
        temp = 24.0 + (random.random() * 4.0)
        
        payload = {
            "ph": round(ph, 2),
            "turbidity_ntu": round(turb, 2),
            "ec_us_cm": round(ec, 2),
            "temperature_c": round(temp, 2),
            "level_ok": True
        }
        logger.debug(f"Generated Mock Payload: {payload}")
        return payload

    def read_latest(self) -> Optional[Dict[str, Any]]:
        with self._lock:
            if not self.hw_mode:
                return self._read_mock()
                
            if self.ser is None or not self.ser.is_open:
                logger.warning("Serial connection lost. Attempting reconnect...")
                self._connect()
                if self.ser is None:
                    return None
            
            try:
                # Flush input buffer to get latest reading
                self.ser.reset_input_buffer()
                
                # Wait for a full line marked by \n
                line = self.ser.readline().decode('utf-8').strip()
                if not line:
                    logger.warning("Read timeout from ESP32")
                    return None
                    
                payload = json.loads(line)
                
                # Validate keys
                required_keys = ['ph', 'turbidity_ntu', 'ec_us_cm', 'temperature_c']
                if all(k in payload for k in required_keys):
                    return payload
                else:
                    logger.error(f"Malformed payload from ESP32: {payload}")
                    return None
                    
            except json.JSONDecodeError:
                logger.error(f"Invalid JSON received: {line}")
                return None
            except Exception as e:
                logger.error(f"Serial read error: {e}")
                self.ser.close()
                return None
