import { Sliders } from 'lucide-react';
import { useThresholds } from '../context/ThresholdContext';

export function ThresholdSettingsButton() {
  const { setIsThresholdModalOpen } = useThresholds();

  return (
    <button
      onClick={() => setIsThresholdModalOpen(true)}
      className="flex items-center space-x-1.5 rounded-lg border border-slate-700/80 bg-slate-800/80 px-2 sm:px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-500/50 hover:bg-slate-700 hover:text-white"
    >
      <Sliders className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-cyan-400" />
      <span className="hidden sm:inline">Calibrate Thresholds</span>
    </button>
  );
}
