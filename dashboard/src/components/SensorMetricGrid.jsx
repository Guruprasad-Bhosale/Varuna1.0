import React from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { Info } from 'lucide-react';

const PARAMETERS = [
  { 
    id: 'ph', name: 'pH Level', unit: '', range: [0, 14], optimal: [6.5, 8.5], 
    color: '#0d9488', // teal
    desc: "Measures water acidity. Values outside 6.5-8.5 harm aquatic life and increase heavy metal toxicity." 
  },
  { 
    id: 'turbidity_ntu', name: 'Turbidity', unit: 'NTU', range: [0, 50], optimal: [0, 10], 
    color: '#d97706', // amber
    desc: "Measures water cloudiness. High turbidity blocks sunlight, reducing photosynthesis and oxygen levels." 
  },
  { 
    id: 'ec_us_cm', name: 'Electrical Cond.', unit: 'µS/cm', range: [0, 2000], optimal: [0, 600], 
    color: '#0ea5e9', // sky
    desc: "Indicates dissolved salts and minerals. Spikes often correlate with industrial effluent or agricultural runoff." 
  },
  { 
    id: 'temperature_c', name: 'Temperature', unit: '°C', range: [0, 40], optimal: [20, 30], 
    color: '#dc2626', // red
    desc: "Affects dissolved oxygen capacity. Thermal pollution from factories can suffocate native fish species." 
  },
  { 
    id: 'particle_count', name: 'Particles', unit: 'count', range: [0, 500], optimal: [0, 100], 
    color: '#64748b', // slate
    desc: "Total suspended solids detected optically. High counts indicate severe physical pollution or debris." 
  },
  { 
    id: 'avg_particle_size_mm', name: 'Avg P. Size', unit: 'mm', range: [0, 5], optimal: [0, 1], 
    color: '#6366f1', // indigo
    desc: "Average diameter of detected matter. Distinguishes between fine silt (safe) and macro-plastics (dangerous)." 
  },
];

export default function SensorMetricGrid({ latestData, historyData }) {
  if (!latestData || !historyData) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {PARAMETERS.map((param) => {
        const value = latestData[param.id];
        const isWarning = value < param.optimal[0] || value > param.optimal[1];
        
        // Prepare sparkline data
        const sparklineData = historyData.slice(-15).map(d => ({ val: d[param.id] }));
        
        // Calculate trend
        let trend = 0;
        if (historyData.length > 1) {
          const prev = historyData[historyData.length - 2][param.id];
          trend = ((value - prev) / (prev || 1)) * 100;
        }

        const progressPct = Math.max(0, Math.min(100, ((value - param.range[0]) / (param.range[1] - param.range[0])) * 100));

        return (
          <div key={param.id} className="card-panel p-5 flex flex-col bg-surface relative group">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-textMain">{param.name}</span>
                <div className="relative group/tooltip">
                  <Info className="w-4 h-4 text-textMuted cursor-help" />
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 bg-navy text-white text-xs p-2 rounded shadow-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-20 pointer-events-none">
                    {param.desc}
                  </div>
                </div>
              </div>
              <div className={`text-xs font-semibold px-2 py-0.5 rounded-md ${isWarning ? 'bg-dangerousBg text-dangerous' : 'bg-background text-textMuted'}`}>
                {trend > 0 ? '↑' : (trend < 0 ? '↓' : '')} {Math.abs(trend).toFixed(1)}%
              </div>
            </div>

            {/* Value & Sparkline */}
            <div className="flex items-end justify-between mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-navy tracking-tight">
                  {typeof value === 'number' ? value.toFixed(1) : '--'}
                </span>
                <span className="text-sm text-textMuted font-medium">{param.unit}</span>
              </div>
              
              <div className="h-8 w-20 opacity-70">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparklineData}>
                    <Line 
                      type="monotone" 
                      dataKey="val" 
                      stroke={isWarning ? '#dc2626' : param.color} 
                      strokeWidth={2} 
                      dot={false}
                      isAnimationActive={false} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Baseline Range Bar */}
            <div className="mt-auto">
              <div className="flex justify-between text-[10px] text-textMuted mb-1 font-medium uppercase">
                <span>Baseline: {param.optimal[0]} - {param.optimal[1]}</span>
                <span className={isWarning ? 'text-dangerous' : 'text-safe'}>{isWarning ? 'Out of bounds' : 'Nominal'}</span>
              </div>
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${progressPct}%`, 
                    backgroundColor: isWarning ? '#dc2626' : param.color 
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
