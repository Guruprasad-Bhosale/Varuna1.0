import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Droplets, Factory, CloudRain, Activity, ChevronUp, ChevronDown } from 'lucide-react';
import { setAnomalyMode } from '../services/api';

export default function SimulationControlDock() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeMode, setActiveMode] = useState("normal");

  const triggers = [
    { id: 'normal', label: 'Nominal Baseline', icon: <Activity className="w-5 h-5" />, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' },
    { id: 'industrial', label: 'Industrial Effluent', icon: <Factory className="w-5 h-5" />, color: 'bg-purple-500/20 text-purple-400 border-purple-500/50' },
    { id: 'monsoon', label: 'Monsoon Runoff', icon: <CloudRain className="w-5 h-5" />, color: 'bg-blue-500/20 text-blue-400 border-blue-500/50' },
    { id: 'alkaline', label: 'Alkaline Spill', icon: <Droplets className="w-5 h-5" />, color: 'bg-rose-500/20 text-rose-400 border-rose-500/50' }
  ];

  const handleTrigger = (id) => {
    setActiveMode(id);
    setAnomalyMode(id);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="glass-panel px-6 py-4 rounded-2xl flex items-center gap-4 mb-2"
          >
            <div className="flex items-center gap-2 border-r border-slate-700 pr-4">
              <AlertTriangle className="text-amber-400 w-5 h-5 animate-pulse" />
              <span className="text-sm font-semibold text-slate-200 tracking-wider">SIMULATION INJECTOR</span>
            </div>
            
            <div className="flex gap-3">
              {triggers.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleTrigger(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                    activeMode === t.id 
                      ? `${t.color} shadow-lg shadow-${t.color.split('-')[1]}/20 scale-105` 
                      : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="mx-auto flex items-center justify-center bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full w-10 h-10 border border-slate-700 shadow-xl transition-colors"
      >
        {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
      </button>
    </div>
  );
}
