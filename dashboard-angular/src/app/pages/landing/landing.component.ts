import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="relative bg-slate-50 overflow-hidden">
      <!-- Hero Section -->
      <div class="relative pt-24 pb-32 lg:pt-36 lg:pb-40">
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div class="inline-flex items-center px-4 py-2 rounded-full border border-cyan-200 bg-cyan-50 text-cyan-700 font-semibold text-sm mb-8 shadow-sm">
            <span class="flex h-2 w-2 relative mr-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            Live Now: Panchaganga River Pilot Node Active
          </div>
          <h1 class="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8">
            River Intelligence, <br class="hidden md:block"/>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Fully Automated.</span>
          </h1>
          <p class="mt-4 max-w-2xl text-xl text-slate-600 mx-auto mb-10">
            Project VARUNA replaces delayed manual grab sampling with continuous, real-time IoT telemetry and Edge AI, delivering sub-second water safety insights.
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <a routerLink="/dashboard" class="inline-flex justify-center items-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-cyan-600 hover:bg-cyan-500 shadow-xl shadow-cyan-500/30 transition-all hover:-translate-y-1">
              Explore Live Telemetry
              <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </a>
            <a routerLink="/contact" class="inline-flex justify-center items-center px-8 py-4 border-2 border-slate-200 text-lg font-bold rounded-xl text-slate-700 bg-white hover:border-slate-300 hover:bg-slate-50 transition-all">
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
            <div class="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition">
              <div class="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center mb-6">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
              </div>
              <h3 class="text-xl font-bold text-slate-900 mb-3">IoT Hardware Nodes</h3>
              <p class="text-slate-600 mb-4">Autonomous ESP32-driven sensing arrays sampling pH, Turbidity, and EC every 20 minutes.</p>
              <a routerLink="/features/iot-hardware-node" class="text-cyan-600 font-semibold hover:text-cyan-700">Learn more &rarr;</a>
            </div>
            <!-- Feature 2 -->
            <div class="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition">
              <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
              </div>
              <h3 class="text-xl font-bold text-slate-900 mb-3">Optical Particle Screener</h3>
              <p class="text-slate-600 mb-4">Pi Camera v3 HDR contour extraction dynamically categorizing micro-debris in turbid waters.</p>
              <a routerLink="/features/optical-particle-screener" class="text-blue-600 font-semibold hover:text-blue-700">Learn more &rarr;</a>
            </div>
            <!-- Feature 3 -->
            <div class="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition">
              <div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
              <h3 class="text-xl font-bold text-slate-900 mb-3">Edge AI Classification</h3>
              <p class="text-slate-600 mb-4">Random Forest ML pipeline running directly on-edge, generating a 0-100 Water Safety Score.</p>
              <a routerLink="/features/edge-ai-classification" class="text-emerald-600 font-semibold hover:text-emerald-700">Learn more &rarr;</a>
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
