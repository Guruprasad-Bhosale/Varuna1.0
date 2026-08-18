import { AlertTriangle, AlertCircle, Clock } from "lucide-react";

export default function AlertsDrawer({ alerts }) {
  return (
    <div className="bg-surface rounded-xl border border-surfaceHover h-full flex flex-col">
      <div className="p-4 border-b border-surfaceHover flex justify-between items-center">
        <h3 className="text-sm font-bold tracking-wide uppercase text-slate-300">Anomaly Log</h3>
        <span className="bg-slate-800 text-xs px-2 py-1 rounded-full text-slate-400">
          {alerts?.length || 0} Alerts
        </span>
      </div>
      
      <div className="p-2 overflow-y-auto flex-grow custom-scrollbar">
        {!alerts || alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-500 space-y-2">
            <ShieldCheck className="w-8 h-8 opacity-20" />
            <p className="text-sm">No recent anomalies detected.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {alerts.map((alert, idx) => {
              const isDangerous = alert.predicted_safety_level === "Dangerous";
              return (
                <li key={idx} className={`p-3 rounded-lg border ${isDangerous ? 'bg-rose-950/20 border-rose-900/50' : 'bg-amber-950/20 border-amber-900/50'}`}>
                  <div className="flex items-start space-x-3">
                    <div className={`mt-0.5 ${isDangerous ? 'text-dangerous' : 'text-moderate'}`}>
                      {isDangerous ? <AlertTriangle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-xs font-bold ${isDangerous ? 'text-rose-400' : 'text-amber-400'}`}>
                          {isDangerous ? 'CRITICAL EVENT' : 'MODERATE WARNING'}
                        </span>
                        <div className="flex items-center text-[10px] text-slate-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 mb-1">
                        Safety Score dropped to {alert.safety_score}.
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {/* Highlights of why it failed - simple heuristic for display */}
                        {alert.ph < 6.5 || alert.ph > 8.5 ? <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">pH: {alert.ph.toFixed(1)}</span> : null}
                        {alert.turbidity_ntu > 15 ? <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">Turbidity: {alert.turbidity_ntu.toFixed(1)}</span> : null}
                        {alert.ec_us_cm > 1000 ? <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">EC: {alert.ec_us_cm.toFixed(0)}</span> : null}
                        {alert.particle_count > 150 ? <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">Particles: {alert.particle_count}</span> : null}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

// Ensure ShieldCheck is available if imported above
import { ShieldCheck } from "lucide-react";
