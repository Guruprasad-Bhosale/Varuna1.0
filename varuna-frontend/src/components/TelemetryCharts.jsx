import React, { useState } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, ReferenceArea 
} from 'recharts';

export default function TelemetryCharts({ historyData }) {
  const [metric, setMetric] = useState('safety_score');
  const [timeRange, setTimeRange] = useState('24h');

  const formatTime = (isoString) => {
    const d = new Date(isoString);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const chartData = historyData.map(d => ({
    ...d,
    timeLabel: formatTime(d.timestamp)
  })).reverse();

  // Metric configs for thresholds and colors
  const config = {
    safety_score: { name: 'Safety Score', color: '#16a34a', domain: [0, 100] },
    ph: { name: 'pH Level', color: '#0d9488', domain: [0, 14], dangerLow: 6.5, dangerHigh: 8.5 },
    turbidity_ntu: { name: 'Turbidity (NTU)', color: '#d97706', domain: [0, 50], dangerHigh: 10 },
    ec_us_cm: { name: 'EC (µS/cm)', color: '#0ea5e9', domain: [0, 1000], dangerHigh: 600 }
  };

  const activeConf = config[metric];

  return (
    <div className="card-panel p-6 flex flex-col h-[400px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-base font-semibold text-navy">Historical Trends</h3>
          <p className="text-xs text-textMuted">Analyze sensor telemetry across time windows</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="text-sm bg-background border border-border rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal text-textMain"
          >
            <option value="safety_score">Water Safety Score</option>
            <option value="ph">pH Level</option>
            <option value="turbidity_ntu">Turbidity</option>
            <option value="ec_us_cm">Electrical Conductivity</option>
          </select>

          <div className="flex bg-background border border-border rounded-md p-0.5">
            {['24h', '7d', '30d'].map(t => (
              <button 
                key={t}
                onClick={() => setTimeRange(t)}
                className={`text-xs px-3 py-1 rounded transition-colors ${timeRange === t ? 'bg-white shadow-sm text-navy font-medium' : 'text-textMuted hover:text-navy'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {metric === 'safety_score' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={activeConf.color} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={activeConf.color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="timeLabel" stroke="#94a3b8" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={activeConf.domain} axisLine={false} tickLine={false} />
              
              {/* Threshold Bands */}
              <ReferenceArea y1={75} y2={100} fill="#dcfce7" fillOpacity={0.4} />
              <ReferenceArea y1={45} y2={75} fill="#fef3c7" fillOpacity={0.4} />
              <ReferenceArea y1={0} y2={45} fill="#fee2e2" fillOpacity={0.4} />

              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ fontSize: '13px', color: '#0f172a', fontWeight: 600 }}
                labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '11px' }}
              />
              <Area type="monotone" dataKey={metric} name={activeConf.name} stroke={activeConf.color} strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" />
            </AreaChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="timeLabel" stroke="#94a3b8" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={activeConf.domain} axisLine={false} tickLine={false} />
              
              {activeConf.dangerHigh && <ReferenceArea y1={activeConf.dangerHigh} y2={activeConf.domain[1]} fill="#fee2e2" fillOpacity={0.5} />}
              {activeConf.dangerLow && <ReferenceArea y1={activeConf.domain[0]} y2={activeConf.dangerLow} fill="#fee2e2" fillOpacity={0.5} />}

              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ fontSize: '13px', color: '#0f172a', fontWeight: 600 }}
                labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '11px' }}
              />
              <Line type="monotone" dataKey={metric} name={activeConf.name} stroke={activeConf.color} strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
