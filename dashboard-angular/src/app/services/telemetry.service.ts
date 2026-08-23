import { Injectable, signal, inject, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, interval, of } from 'rxjs';
export interface TelemetryData {
  nodeId: string;
  locationName: string;
  coordinates: { lat: number; lng: number };
  timestamp: string;
  lastSync: string;
  ph: number;
  turbidity: number;
  turbidity_ntu: number;
  ec: number;
  ec_us_cm: number;
  temperature: number;
  temp_c: number;
  opticalParticulates: number;
  optical_count: number;
  avgParticleSize: number;
  avg_particle_size_mm: number;
  compositeScore: number;
  confidence: number;
  confidence_pct: number;
  status: string;
  bloomProbability: number;
  reasons: string[];
  recommendations: string[];
  // Earth Observation & Satellite Parameters
  chl: number;           // Chlorophyll-a (mg/m³)
  kd490: number;         // Diffuse Attenuation Coefficient at 490nm (m⁻¹)
  tsm: number;           // Total Suspended Matter (g/m³)
  waveHeight: number;    // Significant Wave Height Hs (m)
  rrs443?: number;       // Remote Sensing Reflectance at 443nm (sr⁻¹)
  rrs555?: number;       // Remote Sensing Reflectance at 555nm (sr⁻¹)
  satellitePassTime?: string; // e.g. "EOS-06 OCM Pass: Today 11:42 AM IST"
}

@Injectable({
  providedIn: 'root'
})
export class TelemetryService {
  private baseState: TelemetryData = {
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
    recommendations: ['Conditions nominal. Routine automated sampling active.'],
    chl: 2.10,
    kd490: 0.14,
    tsm: 4.80,
    waveHeight: 1.20,
    satellitePassTime: 'EOS-06 OCM: Nominal Overpass'
  };

  private telemetrySubject = new BehaviorSubject<TelemetryData>(this.baseState);
  public telemetry$: Observable<TelemetryData> = this.telemetrySubject.asObservable();
  public telemetrySignal = signal<TelemetryData>(this.baseState);

  private isSimulated = false;

  private ngZone = inject(NgZone);

  constructor() {
    // Realistic 3.0s Sensor Micro-Jitter & Live Heartbeat Loop outside NgZone
    this.ngZone.runOutsideAngular(() => {
      interval(3000).subscribe(() => {
        if (this.isSimulated) return; // Keep simulation static until reset

        const current = this.telemetrySubject.value;
        const jitterPh = +(current.ph + (Math.random() * 0.04 - 0.02)).toFixed(2);
        const jitterTurbidity = +(Math.max(2.0, current.turbidity + (Math.random() * 0.2 - 0.1))).toFixed(2);
        const jitterEc = +(current.ec + (Math.random() * 3.0 - 1.5)).toFixed(1);
        const jitterTemp = +(current.temperature + (Math.random() * 0.1 - 0.05)).toFixed(1);

        const updated: TelemetryData = {
          ...current,
          timestamp: new Date().toLocaleTimeString(),
          lastSync: new Date().toLocaleTimeString(),
          ph: Math.min(8.5, Math.max(6.5, jitterPh)),
          turbidity: jitterTurbidity,
          turbidity_ntu: jitterTurbidity,
          ec: jitterEc,
          ec_us_cm: jitterEc,
          temperature: jitterTemp,
          temp_c: jitterTemp
        };

        this.telemetrySubject.next(updated);
        this.ngZone.run(() => {
          this.telemetrySignal.set(updated);
        });
      });
    });
  }

  simulateSpike(type: 'dump' | 'rain' | 'alkaline' | 'reset'): void {
    if (type === 'reset') {
      this.isSimulated = false;
      this.telemetrySubject.next(this.baseState);
      this.telemetrySignal.set(this.baseState);
      return;
    }

    this.isSimulated = true;
    const current = this.telemetrySubject.value;
    let modified: TelemetryData;

    if (type === 'dump') {
      modified = {
        ...current,
        ph: 5.12,
        turbidity: 44.8,
        turbidity_ntu: 44.8,
        ec: 1140.0,
        ec_us_cm: 1140.0,
        opticalParticulates: 74,
        avgParticleSize: 0.52,
        compositeScore: 31.5,
        confidence: 97.4,
        status: 'HAZARD',
        bloomProbability: 88.5,
        chl: 8.90,
        tsm: 42.5,
        reasons: ['Severe Acidic Inflow (pH 5.12)', 'Turbidity Surge (44.8 NTU)', 'High Conductivity', 'Spike in ISRO TSM & CHL parameters'],
        recommendations: ['Dispatch field rapid response team', 'Close municipal water intake gates']
      };
    } else if (type === 'rain') {
      modified = {
        ...current,
        ph: 6.84,
        turbidity: 19.5,
        turbidity_ntu: 19.5,
        ec: 260.0,
        ec_us_cm: 260.0,
        compositeScore: 76.2,
        confidence: 91.8,
        status: 'MODERATE',
        bloomProbability: 45.2,
        chl: 3.40,
        tsm: 18.2,
        waveHeight: 2.8,
        reasons: ['Sediment Washout from Runoff', 'Elevated Wave Dynamics'],
        recommendations: ['Monitor silt buildup across lower estuary']
      };
    } else {
      modified = {
        ...current,
        ph: 9.38,
        turbidity: 8.9,
        turbidity_ntu: 8.9,
        ec: 910.0,
        ec_us_cm: 910.0,
        compositeScore: 46.8,
        confidence: 94.2,
        status: 'HAZARD',
        bloomProbability: 72.1,
        chl: 1.10,
        tsm: 7.2,
        reasons: ['Extreme Alkaline Chemical Anomaly', 'Suppressed Bio-optical Activity'],
        recommendations: ['Isolate industrial discharge canal #2']
      };
    }

    this.telemetrySubject.next(modified);
    this.ngZone.run(() => {
      this.telemetrySignal.set(modified);
    });

    // Auto-revert back to nominal live stream after 20 seconds outside NgZone
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.ngZone.run(() => {
          this.simulateSpike('reset');
        });
      }, 20000);
    });
  }

  async getHistory(nodeId = "VARUNA-001", limit = 200) {
    const mockData: TelemetryData[] = [];
    let currentTime = new Date();
    currentTime.setHours(currentTime.getHours() - 24);
    
    let currentPh = 7.3;
    let currentTurb = 4.5;
    let currentEc = 410;
    let currentScore = 95;

    for (let i = 0; i < limit; i++) {
      currentPh += (Math.random() * 0.1 - 0.05);
      currentTurb += (Math.random() * 0.5 - 0.25);
      currentEc += (Math.random() * 10 - 5);
      currentScore = 100 - (Math.abs(7.5 - currentPh) * 10 + currentTurb * 0.5);

      mockData.push({
        ...this.baseState,
        timestamp: new Date(currentTime).toISOString(), // Generate valid ISO string for echarts
        ph: currentPh,
        turbidity: currentTurb,
        turbidity_ntu: currentTurb,
        ec: currentEc,
        ec_us_cm: currentEc,
        compositeScore: Math.min(100, Math.max(0, currentScore))
      });

      currentTime.setMinutes(currentTime.getMinutes() + (24 * 60) / limit);
    }
    
    return { data: mockData, isMock: true };
  }

  async getHotspots() {
    return [];
  }

  async getAlerts() {
    return { data: [], isMock: true };
  }
}
