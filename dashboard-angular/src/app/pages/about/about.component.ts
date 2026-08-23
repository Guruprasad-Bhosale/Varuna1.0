import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../core/services/seo.service';
import { BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, BreadcrumbsComponent],
  template: `
    <div id="mission" class="py-12 md:py-20 scroll-mt-24">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <app-breadcrumbs [crumbs]="[{label: 'About & Mission', path: '/about'}]"></app-breadcrumbs>
        
        <div class="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <!-- Left Column: Mission Log -->
          <div class="lg:col-span-7 stamp-card washi-tape-top p-8 md:p-12 relative">
            <h1 class="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-8 uppercase highlighter-amber inline-block">Mission Log</h1>
            
            <p class="text-xl text-slate-900 mb-10 font-bold leading-relaxed border-l-4 border-slate-900 pl-6">
              Combating delayed manual river sampling in Indian river basins through automated IoT nodes and physics-informed AI intelligence.
            </p>
            
            <div class="space-y-8 text-slate-700">
              <div class="border-b-2 border-slate-200 border-dashed pb-8">
                <h3 class="text-lg font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2"><span class="h-2 w-2 bg-rose-500 rounded-full"></span> The Problem: Latency Kills Ecosystems</h3>
                <p class="font-medium leading-relaxed">Traditional water monitoring relies on manual "grab sampling" — technicians physically driving to rivers, collecting bottles of water, and transporting them to centralized laboratories for chemical analysis. This process introduces a critical <strong class="font-black text-slate-900 bg-rose-100 px-1">24 to 72-hour latency</strong>. By the time an industrial effluent discharge or toxic algal bloom is detected, the ecosystem damage has already occurred.</p>
              </div>

              <div>
                <h3 class="text-lg font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2"><span class="h-2 w-2 bg-teal-500 rounded-full"></span> The Solution: Project VARUNA</h3>
                <p class="font-medium leading-relaxed mb-4">Project VARUNA decentralizes the laboratory. By deploying robust, off-grid IoT nodes directly into the river basin, we perform continuous multi-parameter sampling (pH, Turbidity, EC, Temperature) directly at the source.</p>
                <p class="font-medium leading-relaxed">Coupled with Edge AI inference running on local Raspberry Pi gateways, VARUNA classifies raw telemetry into actionable Water Safety Scores in under <strong class="font-mono font-black text-slate-900 bg-teal-100 px-1">500 ms</strong>, automatically triggering emergency alerts via WhatsApp.</p>
              </div>
            </div>
          </div>
          
          <!-- Right Column: Engineering Log & Notes -->
          <div class="lg:col-span-5 space-y-8">
            <div class="stamp-card p-6 bg-slate-50 relative">
              <h3 class="font-black text-slate-900 uppercase tracking-widest mb-4 border-b-2 border-slate-900 pb-2">Deployment Phases</h3>
              <ul class="space-y-4">
                <li class="flex flex-col">
                  <span class="font-mono font-black text-xs text-slate-500 mb-1">PHASE 01 // 2024</span>
                  <span class="font-bold text-slate-900">Panchaganga River Pilot</span>
                  <span class="text-sm font-medium text-slate-600 mt-1">Initial 4-node deployment proving the edge classification architecture.</span>
                </li>
                <li class="flex flex-col">
                  <span class="font-mono font-black text-xs text-slate-500 mb-1">PHASE 02 // 2025</span>
                  <span class="font-bold text-slate-900 highlighter-teal inline-block self-start">Sindhudurg Estuary Outfalls</span>
                  <span class="text-sm font-medium text-slate-600 mt-1">Scaling to coastal zones with NIRVAAH predictive bio-optical modelling.</span>
                </li>
              </ul>
            </div>

            <div class="stamp-card p-6 bg-white relative">
              <div class="absolute top-0 bottom-0 left-6 w-[2px] bg-rose-200/50"></div>
              <h3 class="font-black text-slate-900 uppercase tracking-widest mb-6 pl-4">Lead Architect</h3>
              <div class="flex items-start space-x-4 pl-4">
                <div class="w-16 h-16 rounded-full border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] bg-slate-100 flex-shrink-0 flex items-center justify-center font-black text-slate-400">GB</div>
                <div>
                  <h4 class="font-black text-slate-900 text-lg uppercase">Guruprasad Bhosale</h4>
                  <p class="text-[11px] font-mono font-bold text-teal-700 mb-3 tracking-widest">FIELD UNIT 01</p>
                  <a href="https://github.com/Guruprasad-Bhosale" class="stamp-btn inline-flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-colors hover:bg-teal-700">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" /></svg>
                    GitHub Log
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AboutComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: 'Our Mission & Origin Story',
      description: 'Learn about the mission behind Project VARUNA and how we are replacing manual grab sampling with IoT environmental intelligence.',
      canonicalUrl: 'https://varuna-iot.org/about'
    });
  }
}
