import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AlertCenter({ alerts }) {
  const getAlertStyles = (level) => {
    if (level === 'Dangerous') return { icon: AlertCircle, color: 'text-dangerous', bg: 'bg-dangerousBg' };
    if (level === 'Moderate') return { icon: AlertTriangle, color: 'text-moderate', bg: 'bg-moderateBg' };
    return { icon: CheckCircle, color: 'text-safe', bg: 'bg-safeBg' };
  };

  return (
    <div className="card-panel flex flex-col h-full">
      <div className="p-4 border-b border-border flex justify-between items-center bg-surfaceHover">
        <h3 className="font-semibold text-navy">Alert Center</h3>
        <span className="text-xs font-medium bg-moderateBg text-moderate px-2 py-1 rounded-full">
          {alerts?.length || 0} Recent Events
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {!alerts || alerts.length === 0 ? (
          <div className="h-full flex items-center justify-center text-textMuted text-sm">
            No active alerts in this time period.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {alerts.slice(0, 8).map((alert, idx) => {
              const style = getAlertStyles(alert.predicted_safety_level);
              const Icon = style.icon;
              
              // Determine primary trigger for display
              let triggerText = "Multiple anomalies";
              if (alert.ph < 6.5 || alert.ph > 8.5) triggerText = `pH bounds exceeded (${alert.ph.toFixed(1)})`;
              else if (alert.turbidity_ntu > 10) triggerText = `High turbidity (${alert.turbidity_ntu.toFixed(0)} NTU)`;
              else if (alert.ec_us_cm > 600) triggerText = `High EC (${alert.ec_us_cm.toFixed(0)} µS/cm)`;

              return (
                <div key={idx} className="flex gap-3 p-3 rounded-md hover:bg-surfaceHover transition-colors border border-transparent hover:border-border">
                  <div className={`mt-0.5 p-2 rounded-full ${style.bg} ${style.color} shrink-0 h-max`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-sm text-navy truncate">
                        {triggerText}
                      </div>
                      <div className="text-[10px] text-textMuted whitespace-nowrap ml-2">
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-textMuted truncate">Node: {alert.node_id}</div>
                      <button className="text-teal hover:text-navy text-[10px] font-semibold uppercase tracking-wider transition-colors">
                        Acknowledge
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
