import React from 'react';
import { MapPin, Battery, Wifi, Clock, ArrowRight } from 'lucide-react';

export default function SafetyHeroCard({ latestData }) {
  if (!latestData) return null;

  const score = latestData.safety_score || 0;
  const level = latestData.predicted_safety_level || "Safe";
  const confidence = latestData.confidence_pct || 0;

  // Status mappings
  let statusColor = "text-safe";
  let statusBg = "bg-safeBg";
  let arcColor = "#16a34a";
  let message = "Suitable under current monitored conditions";

  if (level === "Moderate") {
    statusColor = "text-moderate";
    statusBg = "bg-moderateBg";
    arcColor = "#d97706";
    message = "Water quality degraded. Exercise caution.";
  } else if (level === "Dangerous") {
    statusColor = "text-dangerous";
    statusBg = "bg-dangerousBg";
    arcColor = "#dc2626";
    message = "Hazardous conditions detected. Immediate attention required.";
  }

  // Calculate SVG Gauge properties (Semi-circle)
  const radius = 60;
  const circumference = Math.PI * radius;
  const dashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="card-panel p-6 flex flex-col md:flex-row gap-8 items-center bg-white h-full">
      {/* Left: Node Info */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-md ${statusBg} ${statusColor}`}>
            {level}
          </span>
          <span className="text-xs text-textMuted font-medium">{message}</span>
        </div>
        
        <h2 className="text-2xl font-bold text-navy mb-4">Node 001 — Gad River</h2>
        
        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div className="flex items-center gap-2 text-textMuted">
            <MapPin className="w-4 h-4 text-teal" />
            <span>{latestData.latitude?.toFixed(4)}, {latestData.longitude?.toFixed(4)}</span>
          </div>
          <div className="flex items-center gap-2 text-textMuted">
            <Wifi className="w-4 h-4 text-teal" />
            <span>Connected (LTE)</span>
          </div>
          <div className="flex items-center gap-2 text-textMuted">
            <Battery className="w-4 h-4 text-teal" />
            <span>98% Capacity</span>
          </div>
          <div className="flex items-center gap-2 text-textMuted">
            <Clock className="w-4 h-4 text-teal" />
            <span>{new Date(latestData.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>

        <button className="flex items-center gap-2 text-teal font-medium text-sm hover:text-navy transition-colors w-max">
          View full report <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Clean Gauge */}
      <div className="w-64 flex flex-col items-center justify-center border-l border-border pl-8">
        <div className="relative w-48 h-28 flex justify-center">
          <svg className="w-full h-full" viewBox="0 0 140 80">
            {/* Background Track */}
            <path
              d="M 10 70 A 60 60 0 0 1 130 70"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Value Arc */}
            <path
              d="M 10 70 A 60 60 0 0 1 130 70"
              fill="none"
              stroke={arcColor}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute bottom-0 flex flex-col items-center">
            <div className="text-4xl font-bold text-navy flex items-baseline gap-1">
              {score} <span className="text-lg text-textMuted font-medium">/ 100</span>
            </div>
            <div className="text-xs text-textMuted font-medium mt-1">Water Safety Score</div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <div className="text-sm font-medium text-navy">{confidence.toFixed(1)}% confidence</div>
          <div className="text-xs text-textMuted">AI Classification Model</div>
        </div>
      </div>
    </div>
  );
}
