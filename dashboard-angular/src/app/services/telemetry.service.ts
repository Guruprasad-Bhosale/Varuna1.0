import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface TelemetryData {
  id: number;
  node_id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  ph: number;
  turbidity_ntu: number;
  ec_us_cm: number;
  temperature_c: number;
  particle_count: number;
  avg_particle_size_mm: number;
  predicted_safety_level: string;
  confidence_pct: number;
  safety_score: number;
  alert_sent: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TelemetryService {
  private readonly API_BASE_URL = 'http://localhost:8000/api/v1/telemetry';
  private currentAnomalyMode = "normal";
  private mockHistory: TelemetryData[] = [];

  constructor(private http: HttpClient) {
    this.mockHistory = Array.from({ length: 50 }, () => this.generateMockState());
  }

  setAnomalyMode(mode: string) {
    this.currentAnomalyMode = mode;
  }

  private generateMockState(): TelemetryData {
    let ph = 6.8 + (Math.random() * 0.8 - 0.4);
    let turb = 10 + (Math.random() * 5);
    let ec = 450 + (Math.random() * 50);
    let temp = 25.5 + (Math.random() * 1.5);
    let pCount = Math.floor(80 + Math.random() * 20);
    let pSize = 0.6 + (Math.random() * 0.2);

    if (this.currentAnomalyMode === "industrial") {
      ph = 4.5 + (Math.random() * 0.5);
      ec = 1200 + (Math.random() * 200);
    } else if (this.currentAnomalyMode === "monsoon") {
      turb = 80 + (Math.random() * 30);
      pCount = 300 + Math.floor(Math.random() * 100);
    } else if (this.currentAnomalyMode === "alkaline") {
      ph = 10.5 + (Math.random() * 0.5);
    }
    
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
  }

  async getLatest(nodeId = "VARUNA-001") {
    if (this.currentAnomalyMode !== "normal") {
      const mock = this.generateMockState();
      this.mockHistory.unshift(mock);
      this.mockHistory.pop();
      return { data: mock, isMock: true, forcedAnomaly: true };
    }

    try {
      const response = await firstValueFrom(this.http.get<TelemetryData>(`${this.API_BASE_URL}/latest?node_id=${nodeId}`));
      return { data: response, isMock: false };
    } catch (error) {
      const mock = this.generateMockState();
      this.mockHistory.unshift(mock);
      this.mockHistory.pop();
      return { data: mock, isMock: true };
    }
  }
  
  async getHistory(nodeId = "VARUNA-001", limit = 50) {
    if (this.currentAnomalyMode !== "normal") {
      return { data: this.mockHistory.slice(0, limit), isMock: true, forcedAnomaly: true };
    }

    try {
      const response = await firstValueFrom(this.http.get<TelemetryData[]>(`${this.API_BASE_URL}/history?node_id=${nodeId}&limit=${limit}`));
      if (response && response.length === 0) {
        return { data: this.mockHistory.slice(0, limit), isMock: true };
      }
      return { data: response, isMock: false };
    } catch (error) {
      return { data: this.mockHistory.slice(0, limit), isMock: true };
    }
  }

  async getAlerts() {
    if (this.currentAnomalyMode !== "normal") {
      return { data: this.mockHistory.filter(m => m.alert_sent).slice(0, 10), isMock: true, forcedAnomaly: true };
    }

    try {
      const response = await firstValueFrom(this.http.get<TelemetryData[]>(`${this.API_BASE_URL}/alerts`));
      return { data: response, isMock: false };
    } catch (error) {
      return { data: this.mockHistory.filter(m => m.alert_sent).slice(0, 10), isMock: true };
    }
  }
}
