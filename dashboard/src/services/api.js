import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1/telemetry';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

// Singleton state for UI-driven anomaly injection
let currentAnomalyMode = "normal"; // normal, industrial, monsoon, alkaline

export const setAnomalyMode = (mode) => {
  currentAnomalyMode = mode;
};

// Advanced Mock Fallback Data generator
const generateMockState = () => {
  let ph = 6.8 + (Math.random() * 0.8 - 0.4);
  let turb = 10 + (Math.random() * 5);
  let ec = 450 + (Math.random() * 50);
  let temp = 25.5 + (Math.random() * 1.5);
  let pCount = Math.floor(80 + Math.random() * 20);
  let pSize = 0.6 + (Math.random() * 0.2);

  if (currentAnomalyMode === "industrial") {
    ph = 4.5 + (Math.random() * 0.5); // Acidic
    ec = 1200 + (Math.random() * 200); // High conductivity
  } else if (currentAnomalyMode === "monsoon") {
    turb = 80 + (Math.random() * 30); // Very turbid
    pCount = 300 + Math.floor(Math.random() * 100); // Many particles
  } else if (currentAnomalyMode === "alkaline") {
    ph = 10.5 + (Math.random() * 0.5); // Highly alkaline
  }
  
  // Calculate a deterministic score based on Phase 2 logic approximation
  let score = 100;
  if (ph < 6.5 || ph > 8.5) score -= Math.abs(7.5 - ph) * 8;
  if (turb > 10) score -= (turb - 10) * 0.5;
  if (ec > 600) score -= (ec - 600) * 0.05;
  if (pCount > 100) score -= (pCount - 100) * 0.1;
  
  score = Math.max(0, Math.min(100, score));
  
  let level = score > 75 ? "Safe" : (score > 45 ? "Moderate" : "Dangerous");
  
  return {
    id: Math.floor(Math.random() * 10000),
    node_id: "VARUNA-001",
    timestamp: new Date().toISOString(),
    latitude: 16.142 + (Math.random() * 0.001 - 0.0005),
    longitude: 73.528 + (Math.random() * 0.001 - 0.0005),
    ph: ph,
    turbidity_ntu: turb,
    ec_us_cm: ec,
    temperature_c: temp,
    particle_count: pCount,
    avg_particle_size_mm: pSize,
    predicted_safety_level: level,
    confidence_pct: 92.5 + (Math.random() * 6),
    safety_score: Math.round(score),
    alert_sent: level !== "Safe"
  };
};

// Ensure history has realistic starting data
let mockHistory = Array.from({ length: 50 }, (_, i) => generateMockState());

export const telemetryService = {
  getLatest: async (nodeId = "VARUNA-001") => {
    // If we are forcing an anomaly, we intentionally hijack the stream for UI demonstrations
    if (currentAnomalyMode !== "normal") {
      const mock = generateMockState();
      mockHistory.unshift(mock);
      mockHistory.pop();
      return { data: mock, isMock: true, forcedAnomaly: true };
    }

    try {
      const response = await apiClient.get(`/latest?node_id=${nodeId}`);
      return { data: response.data, isMock: false };
    } catch (error) {
      console.warn("Backend offline, using MOCK latest data.");
      const mock = generateMockState();
      mockHistory.unshift(mock);
      mockHistory.pop();
      return { data: mock, isMock: true };
    }
  },
  
  getHistory: async (nodeId = "VARUNA-001", limit = 50) => {
    if (currentAnomalyMode !== "normal") {
      return { data: mockHistory.slice(0, limit), isMock: true, forcedAnomaly: true };
    }

    try {
      const response = await apiClient.get(`/history?node_id=${nodeId}&limit=${limit}`);
      if (response.data && response.data.length === 0) {
        console.warn("Backend connected but no history data found. Using MOCK history.");
        return { data: mockHistory.slice(0, limit), isMock: true };
      }
      return { data: response.data, isMock: false };
    } catch (error) {
      console.warn("Backend offline or error. Using MOCK history.");
      return { data: mockHistory.slice(0, limit), isMock: true };
    }
  },

  getAlerts: async () => {
    if (currentAnomalyMode !== "normal") {
      return { data: mockHistory.filter(m => m.alert_sent).slice(0, 10), isMock: true, forcedAnomaly: true };
    }

    try {
      const response = await apiClient.get(`/alerts`);
      return { data: response.data, isMock: false };
    } catch (error) {
      return { data: mockHistory.filter(m => m.alert_sent).slice(0, 10), isMock: true };
    }
  }
};
