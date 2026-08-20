import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../core/services/seo.service';
import { BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, BreadcrumbsComponent],
  template: `
    <div class="bg-white py-12 md:py-20">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <app-breadcrumbs [crumbs]="[{label: 'About & Mission', path: '/about'}]"></app-breadcrumbs>
        
        <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-8">Our Mission</h1>
        <div class="prose prose-lg prose-cyan text-slate-600">
          <p class="lead text-2xl text-slate-800 mb-8 font-medium">
            Combating delayed manual river sampling in Indian river basins through automated IoT nodes and physics-informed AI intelligence.
          </p>
          
          <div class="bg-slate-50 p-8 rounded-2xl border border-slate-100 my-10">
            <h3 class="text-xl font-bold text-slate-900 mt-0">The Problem: Latency Kills Ecosystems</h3>
            <p>Traditional water monitoring relies on manual "grab sampling" — technicians physically driving to rivers, collecting bottles of water, and transporting them to centralized laboratories for chemical analysis. This process introduces a critical <strong>24 to 72-hour latency</strong>. By the time an industrial effluent discharge or toxic algal bloom is detected, the ecosystem damage has already occurred, and the pollutant plume has flowed downstream.</p>
          </div>

          <h2>The Solution: Project VARUNA</h2>
          <p>Project VARUNA decentralizes the laboratory. By deploying robust, off-grid IoT nodes directly into the river basin, we perform continuous multi-parameter sampling (pH, Turbidity, EC, Temperature) directly at the source.</p>
          <p>Coupled with Edge AI inference running on local Raspberry Pi gateways, VARUNA classifies raw telemetry into actionable Water Safety Scores in under 500 milliseconds, automatically triggering emergency alerts to municipal authorities via WhatsApp and SMS gateways.</p>
          
          <h2 class="mt-12 mb-8">The Engineering Team</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose">
            <div class="p-6 bg-white border border-slate-200 rounded-xl shadow-sm flex items-start space-x-4">
              <div class="w-16 h-16 rounded-full bg-slate-200 flex-shrink-0"></div>
              <div>
                <h4 class="font-bold text-slate-900">Guruprasad Bhosale</h4>
                <p class="text-sm text-cyan-600 font-medium mb-2">Lead Full-Stack & Edge AI Architect</p>
                <div class="flex space-x-3 text-slate-400">
                  <a href="https://github.com/Guruprasad-Bhosale" class="hover:text-slate-900 transition"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" /></svg></a>
                </div>
              </div>
            </div>
            <!-- Future team members can go here -->
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
