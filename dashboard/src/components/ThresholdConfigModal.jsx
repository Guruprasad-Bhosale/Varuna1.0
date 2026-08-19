import React, { useState } from 'react';
import { X, RotateCcw, Save, Sliders } from 'lucide-react';
import { useThresholds } from '../context/ThresholdContext';

export default function ThresholdConfigModal() {
  const {
    thresholds,
    updateThresholds,
    resetThresholds,
    isThresholdModalOpen,
    setIsThresholdModalOpen
  } = useThresholds();

  const [formState, setFormState] = useState(thresholds);

  if (!isThresholdModalOpen) return null;

  const handlePhChange = (field, val) => {
    setFormState((prev) => ({
      ...prev,
      ph: { ...prev.ph, [field]: parseFloat(val) || 0 }
    }));
  };

  const handleMetricChange = (metric, field, val) => {
    setFormState((prev) => ({
      ...prev,
      [metric]: { ...prev[metric], [field]: parseFloat(val) || 0 }
    }));
  };

  const handleSave = () => {
    updateThresholds(formState);
    setIsThresholdModalOpen(false);
  };

  const handleReset = () => {
    resetThresholds();
    setIsThresholdModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <Sliders className="h-5 w-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Threshold Calibration</h3>
          </div>
          <button
            onClick={() => setIsThresholdModalOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 max-h-[60vh] space-y-4 overflow-y-auto pr-2 text-sm text-slate-300">
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4">
            <h4 className="font-semibold text-cyan-400">pH Bounds (Two-Sided)</h4>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="text-xs text-slate-400">Warning Min</label>
                <input
                  type="number"
                  step="0.1"
                  value={formState.ph.warnMin}
                  onChange={(e) => handlePhChange('warnMin', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-mono text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Safe Min</label>
                <input
                  type="number"
                  step="0.1"
                  value={formState.ph.safeMin}
                  onChange={(e) => handlePhChange('safeMin', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-mono text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Safe Max</label>
                <input
                  type="number"
                  step="0.1"
                  value={formState.ph.safeMax}
                  onChange={(e) => handlePhChange('safeMax', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-mono text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Warning Max</label>
                <input
                  type="number"
                  step="0.1"
                  value={formState.ph.warnMax}
                  onChange={(e) => handlePhChange('warnMax', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-mono text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {[
            { id: 'turbidity_ntu', label: 'Turbidity (NTU)', step: '1' },
            { id: 'ec_us_cm', label: 'Conductivity (µS/cm)', step: '10' },
            { id: 'temperature_c', label: 'Temperature (°C)', step: '0.5' },
            { id: 'particle_count', label: 'Optical Particulates', step: '5' },
            { id: 'avg_particle_size_mm', label: 'Avg Particle Size (mm)', step: '0.05' }
          ].map((param) => (
            <div key={param.id} className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4">
              <h4 className="font-semibold text-slate-200">{param.label}</h4>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400">Safe Upper Limit (🟢)</label>
                  <input
                    type="number"
                    step={param.step}
                    value={formState[param.id].safeMax}
                    onChange={(e) => handleMetricChange(param.id, 'safeMax', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-mono text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Warning Upper Limit (🟡)</label>
                  <input
                    type="number"
                    step={param.step}
                    value={formState[param.id].warnMax}
                    onChange={(e) => handleMetricChange(param.id, 'warnMax', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-mono text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset CPCB Defaults</span>
          </button>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsThresholdModalOpen(false)}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-1.5 rounded-lg bg-cyan-600 px-5 py-2 text-xs font-semibold text-white hover:bg-cyan-500 shadow-lg shadow-cyan-900/30"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
