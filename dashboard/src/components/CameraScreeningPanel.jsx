import React from 'react';
import { Camera, AlertCircle } from 'lucide-react';

export default function CameraScreeningPanel() {
  return (
    <div className="card-panel flex flex-col h-full">
      <div className="p-4 border-b border-border flex justify-between items-center bg-surfaceHover">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-teal" />
          <h3 className="font-semibold text-navy">AI-Assisted Particle Screening</h3>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-4">
        {/* Image Display */}
        <div className="w-full h-48 bg-navy rounded-lg overflow-hidden relative flex items-center justify-center">
          <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] text-white backdrop-blur">
            Latest Sample
          </div>
          {/* Synthetic representation of the bounding box image */}
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#1e293b" />
            {Array.from({ length: 15 }).map((_, i) => (
              <g key={i}>
                <circle cx={`${30 + Math.random() * 40}%`} cy={`${20 + Math.random() * 60}%`} r={Math.random() * 3 + 1} fill="#94a3b8" />
                <rect x={`calc(${30 + Math.random() * 40}% - 4px)`} y={`calc(${20 + Math.random() * 60}% - 4px)`} width="8" height="8" fill="none" stroke="#0ea5e9" strokeWidth="1" />
              </g>
            ))}
          </svg>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-surfaceHover p-3 rounded border border-border">
            <div className="text-textMuted text-xs mb-1">Detected Particles</div>
            <div className="font-bold text-navy">132</div>
          </div>
          <div className="bg-surfaceHover p-3 rounded border border-border">
            <div className="text-textMuted text-xs mb-1">Avg Size</div>
            <div className="font-bold text-navy">0.8 mm</div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-auto flex items-start gap-2 bg-moderateBg/50 p-3 rounded border border-moderateBg text-xs text-moderate">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            <strong>Screening support only.</strong> This optical classification does not serve as laboratory confirmation of microplastics or specific biological contaminants.
          </p>
        </div>
        
        <button className="w-full py-2 bg-surfaceHover hover:bg-slate-100 border border-border rounded text-sm font-medium text-navy transition-colors">
          Compare Recent Samples
        </button>
      </div>
    </div>
  );
}
