import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Brain } from 'lucide-react';

export default function ModelInsights({ latestData }) {
  // Feature importances extracted from the Random Forest model training
  const featureImportances = [
    { name: 'Turbidity', importance: 0.38, impact: 'High', color: '#d97706' },
    { name: 'pH', importance: 0.25, impact: 'High', color: '#0d9488' },
    { name: 'Particle Cnt', importance: 0.18, impact: 'Medium', color: '#64748b' },
    { name: 'EC', importance: 0.12, impact: 'Medium', color: '#0ea5e9' },
    { name: 'Temp', importance: 0.07, impact: 'Low', color: '#dc2626' },
  ];

  const confidence = latestData?.confidence_pct || 0;

  return (
    <div className="card-panel flex flex-col h-full">
      <div className="p-4 border-b border-border flex justify-between items-center bg-surfaceHover">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-teal" />
          <h3 className="font-semibold text-navy">AI Model Insights</h3>
        </div>
        <span className="text-[10px] uppercase font-bold text-textMuted border border-border px-2 py-0.5 rounded">Random Forest</span>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-4">
          <div className="text-sm font-medium text-navy mb-1">Prediction Confidence</div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-teal" style={{ width: `${confidence}%` }}></div>
            </div>
            <span className="text-sm font-bold text-teal">{confidence.toFixed(1)}%</span>
          </div>
          <p className="text-xs text-textMuted mt-2">
            The model is highly confident in the current classification based on the correlation between elevated turbidity and abnormal pH levels compared to the local baseline.
          </p>
        </div>

        <div className="mt-4">
          <div className="text-xs font-bold text-textMuted uppercase tracking-wider mb-3">Top Influencing Factors</div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportances} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} width={70} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px' }} 
                  formatter={(value) => [`${(value * 100).toFixed(0)}%`, 'Weight']}
                />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]} barSize={16}>
                  {featureImportances.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
