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
          <div class="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-8 md:p-12 shadow-sm">
            <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-8">Mission Overview</h1>
            
            <p class="text-xl text-slate-800 mb-10 font-bold leading-relaxed border-l-4 border-teal-600 pl-6">
              Combating delayed manual river sampling in Indian river basins through automated IoT nodes and physics-informed AI intelligence.
            </p>
            
            <div class="space-y-8 text-slate-700">
              <div class="border-b border-slate-100 pb-8">
                <h3 class="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span class="h-2.5 w-2.5 bg-rose-500 rounded-full"></span> 
                  The Problem: Latency Kills Ecosystems
                </h3>
                <p class="font-medium leading-relaxed">
                  Traditional water monitoring relies on manual "grab sampling" — technicians physically driving to rivers, collecting bottles of water, and transporting them to centralized laboratories for chemical analysis. This process introduces a critical <strong class="font-bold text-slate-900 bg-rose-50 text-rose-800 px-1.5 py-0.5 rounded">24 to 72-hour latency</strong>. By the time an industrial effluent discharge or toxic algal bloom is detected, the ecosystem damage has already occurred.
                </p>
              </div>

              <div>
                <h3 class="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span class="h-2.5 w-2.5 bg-teal-600 rounded-full"></span> 
                  The Solution: Project SagarDrishti
                </h3>
                <p class="font-medium leading-relaxed mb-4">
                  Project SagarDrishti decentralizes the laboratory. By deploying robust, off-grid IoT nodes directly into the river basin, we perform continuous multi-parameter sampling (pH, Turbidity, EC, Temperature) directly at the source.
                </p>
                <p class="font-medium leading-relaxed">
                  Coupled with Edge AI inference running on local Raspberry Pi gateways, SagarDrishti classifies raw telemetry into actionable Water Safety Scores in under <strong class="font-mono font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded">500 ms</strong>, automatically triggering emergency alerts via WhatsApp.
                </p>
              </div>
            </div>
          </div>
          
          <!-- Right Column: Engineering Log & Notes -->
          <div class="lg:col-span-5 space-y-8">
            <div class="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h3 class="font-bold text-slate-900 text-lg mb-6 border-b border-slate-100 pb-3">Deployment Phases</h3>
              <ul class="space-y-6">
                <li class="flex flex-col">
                  <span class="font-mono font-bold text-xs text-teal-700 mb-1">PHASE 01 • 2024</span>
                  <span class="font-bold text-slate-900">Panchaganga River Pilot</span>
                  <span class="text-sm font-medium text-slate-600 mt-1">Initial 4-node deployment proving the edge classification architecture.</span>
                </li>
                <li class="flex flex-col">
                  <span class="font-mono font-bold text-xs text-teal-700 mb-1">PHASE 02 • 2025</span>
                  <span class="font-bold text-slate-900">Sindhudurg Estuary Outfalls</span>
                  <span class="text-sm font-medium text-slate-600 mt-1">Scaling to coastal zones with NIRVAAH predictive bio-optical modelling.</span>
                </li>
              </ul>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h3 class="font-bold text-slate-900 text-lg mb-6 border-b border-slate-100 pb-3">Lead Architect</h3>
              <div class="flex items-start space-x-4">
                <div class="w-14 h-14 rounded-full bg-teal-100 text-teal-800 font-bold text-base flex-shrink-0 flex items-center justify-center">GB</div>
                <div>
                  <h4 class="font-bold text-slate-900 text-base">Guruprasad Bhosale</h4>
                  <p class="text-xs font-mono font-semibold text-teal-700 mb-3">Field Unit 01</p>
                  <a href="https://github.com/Guruprasad-Bhosale" target="_blank" class="inline-flex items-center gap-2 bg-slate-900 hover:bg-teal-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors">
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
      title: 'Our Mission & Architecture',
      description: 'Learn about the mission behind Project SagarDrishti and how we are replacing manual grab sampling with IoT environmental intelligence.',
      canonicalUrl: 'https://sagardrishti.org/about'
    });
  }
}

