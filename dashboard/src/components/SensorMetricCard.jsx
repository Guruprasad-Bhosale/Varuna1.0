import React from 'react';
import { Info, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { evaluateParameterHealth } from '../utils/thresholdEvaluator';
import { useThresholds } from '../context/ThresholdContext';

export default function SensorMetricCard({ config, value }) {
  const { thresholds } = useThresholds();
  const health = evaluateParameterHealth(config.id, value, thresholds);

  const statusIcons = {
    safe: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />,
    moderate: <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />,
    dangerous: <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
  };

  const progressPercent = Math.min(
    100,
    Math.max(8, ((value ?? 0) / config.maxScale) * 100)
  );

  return (
    <div
      className={`relative rounded-xl border p-5 backdrop-blur-md transition-all duration-700 ease-in-out ${health.cardClass}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold tracking-wide text-slate-200">
            {config.title}
          </span>

          <div className="group relative flex items-center">
            <button
              type="button"
              className="text-slate-500 transition-colors duration-200 hover:text-cyan-400 focus:outline-none"
              aria-label={`Hardware details for ${config.title}`}
            >
              <Info className="h-4 w-4 cursor-pointer" />
            </button>

            <div className="pointer-events-none absolute -left-2 top-7 z-50 w-72 rounded-lg border border-slate-700/80 bg-slate-900/95 p-3.5 text-xs shadow-2xl backdrop-blur-md opacity-0 transition-all duration-200 ease-out group-hover:pointer-events-auto group-hover:opacity-100">
              <div className="border-b border-slate-800 pb-2">
                <p className="font-semibold text-cyan-400">{config.sensorName}</p>
                <p className="text-[11px] text-slate-400">{config.sensorModel}</p>
              </div>
              <div className="mt-2 space-y-1.5 text-slate-300">
                <p><span className="font-medium text-slate-400">Principle:</span> {config.principle}</p>
                <p><span className="font-medium text-slate-400">Location:</span> {config.placement}</p>
                <p><span className="font-medium text-slate-400">Calibration:</span> {config.calibration}</p>
              </div>
            </div>
          </div>
        </div>

        <span
          className={`flex items-center space-x-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wider transition-all duration-500 ease-in-out ${health.badgeClass}`}
        >
          {statusIcons[health.status]}
          <span>{health.label}</span>
        </span>
      </div>

      <div className="mt-4 flex items-baseline space-x-2">
        <span className="font-mono text-3xl font-bold tracking-tight text-white transition-colors duration-500">
          {typeof value === 'number' ? value.toFixed(config.precision ?? 1) : '--'}
        </span>
        <span className="text-sm font-medium text-slate-400">{config.unit}</span>
      </div>

      <p className="mt-1 text-xs text-slate-400">
        Standard: <span className="text-slate-300 font-mono">{config.baselineText}</span>
      </p>

      <div className="mt-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800/80">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${health.barColor} ${health.barGlow}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
