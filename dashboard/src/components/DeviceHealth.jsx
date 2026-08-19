import React from 'react';
import { Cpu, Server, Battery, Cloud, RefreshCw, Activity } from 'lucide-react';

export default function DeviceHealth() {
  const healthMetrics = [
    { label: "Raspberry Pi", value: "Online", icon: Cpu, status: "good" },
    { label: "ESP32 UART", value: "Connected", icon: Server, status: "good" },
    { label: "pH Sensor", value: "Calibrated", icon: Activity, status: "good" },
    { label: "Turbidity Sensor", value: "Online", icon: Activity, status: "good" },
    { label: "EC Sensor", value: "Online", icon: Activity, status: "good" },
    { label: "LTE Sync", value: "12ms ping", icon: Cloud, status: "good" },
    { label: "Battery", value: "98% (Solar)", icon: Battery, status: "good" },
    { label: "Last Sample", value: "2 mins ago", icon: RefreshCw, status: "good" },
  ];

  return (
    <div className="card-panel flex flex-col h-full">
      <div className="p-4 border-b border-border bg-surfaceHover">
        <h3 className="font-semibold text-navy">Device Health</h3>
      </div>
      
      <div className="p-4 flex flex-col gap-4 flex-1 justify-center">
        {healthMetrics.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-textMuted" />
                <span className="text-sm font-medium text-navy">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-textMuted">{item.value}</span>
                <span className="w-2 h-2 rounded-full bg-safe"></span>
              </div>
            </div>
          );
        })}
        
        <button className="mt-2 w-full py-2 border border-border text-teal text-sm font-medium rounded hover:bg-surfaceHover transition-colors">
          Run Remote Diagnostics
        </button>
      </div>
    </div>
  );
}
