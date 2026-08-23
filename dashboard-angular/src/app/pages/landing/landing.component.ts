import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { WavesShaderComponent } from '../../components/ui/waves-shader/waves-shader.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, WavesShaderComponent],
  template: `
    <div class="relative overflow-hidden min-h-screen">
      <!-- Hero Section -->
      <div class="relative min-h-[88vh] flex flex-col items-center justify-center text-center px-4 py-16 overflow-hidden">
        
        <!-- Ambient WebGL Wave Background Layer (Low Opacity for Readability) -->
        <app-waves-shader class="absolute inset-0 z-0 opacity-15 pointer-events-auto"></app-waves-shader>

        <!-- Hero Main Content Box -->
        <div class="relative z-10 max-w-5xl mx-auto space-y-7 flex flex-col items-center">
          
          <!-- Stamped Pilot Status Banner -->
          <div class="rotate-[-0.5deg]">
            <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-xl border-2 border-slate-900 bg-teal-50 shadow-[3px_3px_0px_0px_#0f172a]">
              <span class="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span class="font-mono text-xs font-black text-teal-950 uppercase tracking-wider">
                LIVE TELEMETRY: SINDHUDURG BASIN PILOT NODE ACTIVE
              </span>
            </div>
          </div>

          <!-- Restored Clean 2D Headline -->
          <div class="space-y-3">
            <h1 class="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
              River Intelligence,<br>
              <span class="text-teal-700 inline-block">Fully Automated.</span>
            </h1>
            <p class="max-w-2xl mx-auto text-base sm:text-lg font-bold text-slate-700 leading-relaxed">
              Project JalDrishti replaces delayed manual grab sampling with continuous IoT edge telemetry, optical particulate flow screening, and NIRVAAH AI bloom forecasting.
            </p>
          </div>

          <!-- High-Contrast CTA Cluster -->
          <div class="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <!-- Primary Action: Solid Teal Fill + White Text + Slate Outline -->
            <a routerLink="/dashboard" 
               class="stamp-btn px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-black text-sm uppercase tracking-wider rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_#0f172a] hover:shadow-[6px_6px_0px_0px_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2.5">
              <span>Explore Live Telemetry</span>
              <svg class="h-4 w-4 text-white stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>

            <!-- Secondary Action: Solid White Fill + Dark Slate Text -->
            <a routerLink="/contact" 
               class="stamp-btn px-8 py-4 bg-white hover:bg-slate-50 text-slate-900 font-black text-sm uppercase tracking-wider rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_#0f172a] hover:shadow-[6px_6px_0px_0px_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
              Deploy Monitoring Node
            </a>
          </div>

          <!-- Telemetry Specimen Metric Cards -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 w-full max-w-3xl">
            <div class="stamp-card p-3.5 bg-white text-left">
              <div class="font-mono text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sampling Cycle</div>
              <div class="font-mono text-base font-black text-slate-900 mt-0.5">20 Minutes</div>
            </div>
            <div class="stamp-card p-3.5 bg-white text-left">
              <div class="font-mono text-[10px] text-slate-500 font-bold uppercase tracking-wider">Alert Dispatch</div>
              <div class="font-mono text-base font-black text-teal-700 mt-0.5">&lt; 3 Seconds</div>
            </div>
            <div class="stamp-card p-3.5 bg-white text-left">
              <div class="font-mono text-[10px] text-slate-500 font-bold uppercase tracking-wider">AI Lead Time</div>
              <div class="font-mono text-base font-black text-slate-900 mt-0.5">48–72 Hours</div>
            </div>
            <div class="stamp-card p-3.5 bg-white text-left">
              <div class="font-mono text-[10px] text-slate-500 font-bold uppercase tracking-wider">Edge Vision</div>
              <div class="font-mono text-base font-black text-slate-900 mt-0.5">YOLOv8-SEG</div>
            </div>
          </div>

        </div>
      </div>

      <!-- Features Grid -->
      <div class="py-20 border-t-2 border-slate-900 bg-white/70">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <div class="inline-block highlighter-teal px-3 py-1 font-mono font-black text-xs uppercase tracking-wider text-teal-900 mb-3 border border-teal-200">System Architecture</div>
            <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Edge Intelligence Architecture</h2>
            <p class="mt-4 text-base sm:text-lg text-slate-700 font-bold max-w-2xl mx-auto">Built for resilient, off-grid environmental monitoring in Indian river basins.</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Feature 1 -->
            <div class="stamp-card p-8 bg-white relative group">
              <div class="washi-tape-top"></div>
              <div class="w-12 h-12 bg-teal-100 border-2 border-slate-900 rounded-xl flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_#0f172a]">
                <svg class="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
              </div>
              <h3 class="text-xl font-black text-slate-900 mb-3 uppercase tracking-wide">IoT Hardware Nodes</h3>
              <p class="text-slate-700 font-medium mb-4 leading-relaxed">Autonomous ESP32-driven sensing arrays sampling pH, Turbidity, EC, and Temperature every 20 minutes.</p>
              <a routerLink="/features/iot-hardware-node" class="text-teal-700 font-black text-sm hover:text-teal-900 inline-flex items-center gap-1">Learn more &rarr;</a>
            </div>

            <!-- Feature 2 -->
            <div class="stamp-card p-8 bg-white relative group">
              <div class="washi-tape-top"></div>
              <div class="w-12 h-12 bg-amber-100 border-2 border-slate-900 rounded-xl flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_#0f172a]">
                <svg class="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
              </div>
              <h3 class="text-xl font-black text-slate-900 mb-3 uppercase tracking-wide">Optical Particle Screener</h3>
              <p class="text-slate-700 font-medium mb-4 leading-relaxed">Pi Camera v3 HDR contour extraction dynamically categorizing suspended micro-debris in turbid waters.</p>
              <a routerLink="/features/optical-particle-screener" class="text-amber-700 font-black text-sm hover:text-amber-900 inline-flex items-center gap-1">Learn more &rarr;</a>
            </div>

            <!-- Feature 3 -->
            <div class="stamp-card p-8 bg-white relative group">
              <div class="washi-tape-top"></div>
              <div class="w-12 h-12 bg-rose-100 border-2 border-slate-900 rounded-xl flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_#0f172a]">
                <svg class="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
              <h3 class="text-xl font-black text-slate-900 mb-3 uppercase tracking-wide">Edge AI Classification</h3>
              <p class="text-slate-700 font-medium mb-4 leading-relaxed">Random Forest ML pipeline running directly on-edge, generating a 0-100 Water Safety Score in &lt;500ms.</p>
              <a routerLink="/features/edge-ai-classification" class="text-rose-700 font-black text-sm hover:text-rose-900 inline-flex items-center gap-1">Learn more &rarr;</a>
            </div>
          </div>
        </div>
      </div>
      
      <!-- SLA Banner -->
      <div class="bg-slate-900 py-16 text-center text-white border-t-2 border-slate-900">
        <h3 class="text-2xl font-black text-white mb-6 uppercase tracking-wider">Service Level Guarantee</h3>
        <div class="flex flex-wrap justify-center gap-4 px-4">
          <span class="stamp-card px-4 py-2 bg-slate-800 text-emerald-400 font-mono text-sm font-bold border-emerald-500">20-minute cycle frequency</span>
          <span class="stamp-card px-4 py-2 bg-slate-800 text-teal-400 font-mono text-sm font-bold border-teal-500">&lt; 500ms edge classification</span>
          <span class="stamp-card px-4 py-2 bg-slate-800 text-rose-400 font-mono text-sm font-bold border-rose-500">&lt; 3-second alert dispatch</span>
        </div>
      </div>
    </div>
  `
})
export class LandingComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: 'Automated River Water Quality Intelligence',
      description: 'Project JalDrishti replaces delayed manual grab sampling with continuous, real-time IoT telemetry and Edge AI.',
      canonicalUrl: 'https://jaldrishti.org/',
      schemaJson: {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Project JalDrishti",
        "applicationCategory": "EnvironmentalMonitoringApplication",
        "operatingSystem": "Web, Edge Linux"
      }
    });
  }
}

