import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Activity, Microscope } from 'lucide-react';

export default function OpticalScreeningModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="glass-panel w-full max-w-5xl rounded-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-lg">
                <Microscope className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Edge Optical Screening Diagnostics</h3>
                <p className="text-xs text-slate-400 font-mono">Pi Camera V3 • Contour Analysis Layer Active</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col md:flex-row h-[60vh]">
            {/* Image Viewer */}
            <div className="flex-1 bg-black relative flex items-center justify-center p-4 border-r border-slate-800">
              <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded text-xs font-mono text-emerald-400 border border-emerald-900 z-10 backdrop-blur">
                LIVE FEED • BOUNDING BOXES: ON
              </div>
              <div className="absolute top-4 right-4 z-10">
                <button className="bg-slate-800/80 p-2 rounded text-slate-300 hover:text-white backdrop-blur border border-slate-700">
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
              
              {/* Synthetic Mock Image containing generated noise for bounding boxes */}
              <div className="relative w-full h-full max-w-2xl bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="water" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#0f172a" />
                      <stop offset="100%" stopColor="#020617" />
                    </radialGradient>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#water)" />
                  {/* Mock Particulates with Bounding Boxes */}
                  {Array.from({ length: 45 }).map((_, i) => (
                    <g key={i}>
                      <circle 
                        cx={`${20 + Math.random() * 60}%`} 
                        cy={`${20 + Math.random() * 60}%`} 
                        r={Math.random() * 4 + 1} 
                        fill="#94a3b8" 
                        opacity={0.6}
                      />
                      <rect 
                        x={`calc(${20 + Math.random() * 60}% - 5px)`} 
                        y={`calc(${20 + Math.random() * 60}% - 5px)`} 
                        width="10" height="10" 
                        fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2"
                      />
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="w-full md:w-80 bg-slate-900/50 p-6 flex flex-col gap-6 overflow-y-auto">
              <div>
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Particle Distribution</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Micro-debris (&lt;1mm)</span>
                      <span className="text-white font-mono">68%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-primary h-1.5 rounded-full" style={{width: '68%'}}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Coarse Particulates (1-3mm)</span>
                      <span className="text-white font-mono">25%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-amber-400 h-1.5 rounded-full" style={{width: '25%'}}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Macro-plastics (&gt;3mm)</span>
                      <span className="text-white font-mono">7%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-rose-400 h-1.5 rounded-full" style={{width: '7%'}}></div></div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800">
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Algorithm Confidence</h4>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 flex items-center justify-center border-t-emerald-500">
                    <span className="font-mono text-emerald-400 font-bold">96%</span>
                  </div>
                  <div className="text-xs text-slate-400 leading-relaxed">
                    Gaussian thresholding successfully separated background water noise from solid matter.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
