export interface BloomPredictionData {
  nodeId: string;
  stationName: string;
  riverBasin: string;
  latitude: number;
  longitude: number;
  syncTime: string;
  connectionType: string;
  firmwareVersion: string;
  riskScore: number; // 0 - 100
  confidence: number;
  modelEngine: string;
}
