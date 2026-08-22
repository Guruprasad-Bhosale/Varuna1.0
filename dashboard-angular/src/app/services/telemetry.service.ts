import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, interval, of } from 'rxjs';
import { TelemetryData } from '../core/models/telemetry.model';

export type { TelemetryData };

@Injectable({
  providedIn: 'root'
})
export class TelemetryService {
  private initialData: TelemetryData = {
    nodeId: 'VARUNA-001',
    locationName: 'Sindhudurg District — Gad & Karli Rivers',
    coordinates: { lat: 16.2699, lng: 73.7148 },
    timestamp: new Date().toLocaleTimeString(),
    lastSync: new Date().toLocaleTimeString(),
    ph: 7.35,
    turbidity: 4.80,
    turbidity_ntu: 4.80,
    ec: 420.0,
    ec_us_cm: 420.0,
    temperature: 25.4,
    temp_c: 25.4,
    opticalParticulates: 18,
    optical_count: 18,
    avgParticleSize: 0.28,
    avg_particle_size_mm: 0.28,
    compositeScore: 94.8,
    confidence: 94.8,
    confidence_pct: 94.8,
    status: 'SAFE',
    bloomProbability: 12.4,
    reasons: ['Optimal Dissolved Oxygen', 'Nominal Thermal Profile'],
    recommendations: ['Conditions nominal. Routine automated sampling active.']
  };

  private telemetrySubject = new BehaviorSubject<TelemetryData>(this.initialData);
  public telemetry$: Observable<TelemetryData> = this.telemetrySubject.asObservable();
  public telemetrySignal = signal<TelemetryData>(this.initialData);

  constructor() {
    // Keep timestamp active
    interval(3000).subscribe(() => {
      const current = this.telemetrySubject.value;
      const updated: TelemetryData = {
        ...current,
        timestamp: new Date().toLocaleTimeString(),
        lastSync: new Date().toLocaleTimeString()
      };
      this.telemetrySubject.next(updated);
      this.telemetrySignal.set(updated);
    });
  }

  simulateSpike(type: 'dump' | 'rain' | 'alkaline'): void {
    const current = this.telemetrySubject.value;
    let modified: TelemetryData;

    if (type === 'dump') {
      modified = {
        ...current,
        ph: 5.10,
        turbidity: 42.5,
        turbidity_ntu: 42.5,
        ec: 1120.0,
        ec_us_cm: 1120.0,
        compositeScore: 32.4,
        confidence: 96.2,
        confidence_pct: 96.2,
        status: 'HAZARD',
        reasons: ['High Turbidity Spike', 'Acidic Inflow', 'Conductivity Surge'],
        recommendations: ['Dispatch field response team', 'Halt downstream intake valves']
      };
    } else if (type === 'rain') {
      modified = {
        ...current,
        ph: 6.80,
        turbidity: 18.2,
        turbidity_ntu: 18.2,
        ec: 280.0,
        ec_us_cm: 280.0,
        compositeScore: 78.0,
        confidence: 91.0,
        confidence_pct: 91.0,
        status: 'MODERATE',
        reasons: ['Suspended Sediment Washout'],
        recommendations: ['Monitor silt accumulation at estuarine gates']
      };
    } else {
      modified = {
        ...current,
        ph: 9.40,
        turbidity: 9.1,
        turbidity_ntu: 9.1,
        ec: 890.0,
        ec_us_cm: 890.0,
        compositeScore: 48.6,
        confidence: 93.5,
        confidence_pct: 93.5,
        status: 'HAZARD',
        reasons: ['Severe Alkaline Anomaly'],
        recommendations: ['Isolate industrial discharge canal']
      };
    }

    this.telemetrySubject.next(modified);
    this.telemetrySignal.set(modified);
  }

  async getHistory(nodeId = "VARUNA-001", limit = 500) {
    return { data: [this.telemetrySubject.value], isMock: true };
  }

  async getHotspots() {
    return [];
  }

  async getAlerts() {
    return { data: [], isMock: true };
  }
}
