import React from 'react';
import { LayoutDashboard, Map, Activity, Bell, Camera, Settings, Network, CheckCircle2 } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'map', label: 'River Nodes', icon: Map },
    { id: 'live', label: 'Live Monitoring', icon: Activity },
    { id: 'trends', label: 'Historical Trends', icon: Network },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'camera', label: 'Camera Screening', icon: Camera },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-navy text-white flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal rounded flex items-center justify-center">
            <span className="font-bold text-lg leading-none">V</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide">VARUNA</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 flex flex-col gap-1 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Menu</div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                isActive 
                  ? 'bg-teal text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-md p-3 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-teal shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-white">All systems operational</div>
            <div className="text-xs text-slate-400 mt-1">Network & ML services healthy</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
