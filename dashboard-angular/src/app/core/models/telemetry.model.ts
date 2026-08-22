export interface TelemetryData {
  nodeId: string;
  locationName: string;
  coordinates: { lat: number; lng: number };
  timestamp: string;
  lastSync?: string;
  
  // Core Sensors
  ph: number;
  turbidity: number;
  turbidity_ntu?: number;
  ec: number;
  ec_us_cm?: number;
  temperature: number;
  temp_c?: number;
  opticalParticulates: number;
  optical_count?: number;
  avgParticleSize: number;
  avg_particle_size_mm?: number;

  // ML Intelligence & NIRVAAH Models
  compositeScore: number;
  confidence: number;
  confidence_pct?: number;
  status: 'SAFE' | 'MODERATE' | 'HAZARD' | 'NOMINAL';
  bloomProbability?: number;
  reasons?: string[];
  recommendations?: string[];
}
