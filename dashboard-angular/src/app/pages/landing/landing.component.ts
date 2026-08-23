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
    <div class="relative bg-white overflow-hidden min-h-screen">
      <!-- WebGL Background -->
      <div class="absolute inset-0 opacity-25 pointer-events-auto z-0">
        <app-waves-shader></app-waves-shader>
      </div>

      <!-- Hero Section -->
      <div class="relative pt-24 pb-32 lg:pt-36 lg:pb-40 z-10">
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-md border-2 border-slate-900 bg-teal-50 text-teal-900 font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#0f172a] rotate-[-0.5deg] mb-8">
            <span class="h-2 w-2 rounded-full bg-teal-500 animate-ping"></span>
            <span>[ PILOT NODE: PANCHAGANGA ⚡ ACTIVE TELEMETRY ]</span>
          </div>
          <h1 class="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8">
            River Intelligence, <br class="hidden md:block"/>
            <span class="highlighter-teal text-teal-900">Fully Automated.</span>
          </h1>
          <p class="mt-4 max-w-2xl text-xl text-slate-800 font-medium mx-auto mb-10">
            Project VARUNA replaces delayed manual grab sampling with continuous, real-time IoT telemetry and Edge AI, delivering sub-second water safety insights.
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <a routerLink="/dashboard" class="stamp-btn inline-flex justify-center items-center px-8 py-4 bg-teal-600 text-white hover:bg-teal-500 shadow-[4px_4px_0px_0px_#0f172a] active:translate-x-1 active:translate-y-1 active:shadow-none text-lg font-black uppercase tracking-wider">
              Explore Live Telemetry &rarr;
            </a>
            <a routerLink="/contact" class="stamp-btn inline-flex justify-center items-center px-8 py-4 bg-white text-slate-900 hover:bg-slate-50 border-2 border-slate-900 shadow-[4px_4px_0px_0px_#0f172a] text-lg font-black uppercase tracking-wider">
              Deploy Monitoring Node
            </a>
          </div>
        </div>
      </div>

      <!-- Features Grid -->
      <div class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-3xl font-bold text-slate-900">Edge Intelligence Architecture</h2>
            <p class="mt-4 text-lg text-slate-600">Built for resilient, off-grid environmental monitoring.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
            <!-- Feature 1 -->
            <div class="stamp-card p-8 bg-white relative">
              <div class="washi-tape-top absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-amber-100/80 z-20 transform -rotate-2"></div>
              <div class="w-12 h-12 border-2 border-slate-900 bg-teal-100 text-teal-900 shadow-[2px_2px_0px_0px_#0f172a] rounded-xl flex items-center justify-center mb-6">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
              </div>
              <h3 class="text-xl font-black text-slate-900 mb-3 uppercase">IoT Hardware Nodes</h3>
              <p class="text-slate-800 font-medium mb-4">Autonomous ESP32-driven sensing arrays sampling pH, Turbidity, and EC every 20 minutes.</p>
              <a routerLink="/features/iot-hardware-node" class="text-teal-700 font-black uppercase text-sm border-b-2 border-teal-700 pb-0.5 hover:text-teal-900 hover:border-teal-900">Learn more &rarr;</a>
            </div>
            <!-- Feature 2 -->
            <div class="stamp-card p-8 bg-white relative">
              <div class="washi-tape-top absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-teal-100/80 z-20 transform rotate-1"></div>
              <div class="w-12 h-12 border-2 border-slate-900 bg-sky-100 text-sky-900 shadow-[2px_2px_0px_0px_#0f172a] rounded-xl flex items-center justify-center mb-6">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
              </div>
              <h3 class="text-xl font-black text-slate-900 mb-3 uppercase">Optical Particle Screener</h3>
              <p class="text-slate-800 font-medium mb-4">Pi Camera v3 HDR contour extraction dynamically categorizing micro-debris in turbid waters.</p>
              <a routerLink="/features/optical-particle-screener" class="text-sky-700 font-black uppercase text-sm border-b-2 border-sky-700 pb-0.5 hover:text-sky-900 hover:border-sky-900">Learn more &rarr;</a>
            </div>
            <!-- Feature 3 -->
            <div class="stamp-card p-8 bg-white relative">
              <div class="washi-tape-top absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-rose-100/80 z-20 transform -rotate-1"></div>
              <div class="w-12 h-12 border-2 border-slate-900 bg-emerald-100 text-emerald-900 shadow-[2px_2px_0px_0px_#0f172a] rounded-xl flex items-center justify-center mb-6">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
              <h3 class="text-xl font-black text-slate-900 mb-3 uppercase">Edge AI Classification</h3>
              <p class="text-slate-800 font-medium mb-4">Random Forest ML pipeline running directly on-edge, generating a 0-100 Water Safety Score.</p>
              <a routerLink="/features/edge-ai-classification" class="text-emerald-700 font-black uppercase text-sm border-b-2 border-emerald-700 pb-0.5 hover:text-emerald-900 hover:border-emerald-900">Learn more &rarr;</a>
            </div>
          </div>
        </div>
      </div>
      
      <!-- SLA Banner -->
      <div class="bg-slate-900 py-16 text-center">
        <h3 class="text-2xl font-bold text-white mb-6">Service Level Guarantee</h3>
        <div class="flex flex-wrap justify-center gap-4 px-4">
          <span class="px-4 py-2 bg-slate-800 text-emerald-400 rounded-full font-mono text-sm border border-slate-700">20-minute cycle frequency</span>
          <span class="px-4 py-2 bg-slate-800 text-cyan-400 rounded-full font-mono text-sm border border-slate-700">&lt; 500ms edge classification</span>
          <span class="px-4 py-2 bg-slate-800 text-rose-400 rounded-full font-mono text-sm border border-slate-700">&lt; 3-second alert dispatch</span>
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
      description: 'Project VARUNA replaces delayed manual grab sampling with continuous, real-time IoT telemetry and Edge AI.',
      canonicalUrl: 'https://varuna-iot.org/',
      schemaJson: {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Project VARUNA",
        "applicationCategory": "EnvironmentalMonitoringApplication",
        "operatingSystem": "Web, Edge Linux"
      }
    });
  }
}
