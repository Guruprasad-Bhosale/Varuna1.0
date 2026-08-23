import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-feature-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, BreadcrumbsComponent],
  template: `
    <div id="technology" class="py-12 md:py-20 scroll-mt-24" *ngIf="feature">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <app-breadcrumbs [crumbs]="[
          {label: 'Technology Features', path: '/features'},
          {label: feature.title, path: '/features/' + feature.id}
        ]"></app-breadcrumbs>
        
        <div class="mt-8 stamp-card washi-tape-top p-8 md:p-12 relative bg-white">
          <h1 class="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 uppercase inline-block highlighter-amber">{{ feature.title }}</h1>
          <p class="text-xl font-bold text-slate-700 mb-10 border-l-4 border-slate-900 pl-4 py-1">{{ feature.subtitle }}</p>

          <div class="prose prose-lg max-w-none prose-slate prose-headings:font-black prose-headings:text-slate-900 prose-headings:uppercase prose-headings:tracking-widest">
            <div [innerHTML]="feature.content"></div>
          </div>
        </div>
        
        <div class="mt-12 stamp-card p-6 bg-slate-50 relative">
          <h3 class="text-xs font-black text-slate-900 mb-4 uppercase tracking-widest border-b-2 border-slate-900 pb-2 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-slate-900"></span>
            Explore Engineering Blueprints
          </h3>
          <div class="flex flex-wrap gap-3 mt-4">
            <a *ngFor="let link of otherFeatures" [routerLink]="'/features/' + link.id" class="stamp-btn px-4 py-2 bg-white text-[11px] font-black text-slate-900 uppercase tracking-wider hover:bg-slate-100 transition-colors rounded-lg">
              {{ link.title }}
            </a>
          </div>
        </div>
      </div>
    </div>
    
    <div class="py-20 text-center" *ngIf="!feature">
      <div class="stamp-card inline-block p-8 bg-white mx-auto">
        <h2 class="text-2xl font-black text-slate-900 uppercase tracking-widest mb-4">Blueprint Missing</h2>
        <a routerLink="/" class="stamp-btn bg-slate-900 text-white px-6 py-3 text-sm font-black uppercase tracking-wider transition-colors hover:bg-teal-700 rounded-xl inline-block">Return Home</a>
      </div>
    </div>
  `
})
export class FeatureDetailComponent implements OnInit {
  featureId: string = '';
  feature: any = null;
  otherFeatures: any[] = [];

  private featuresDB: Record<string, any> = {
    'iot-hardware-node': {
      id: 'iot-hardware-node',
      title: 'IoT Hardware Node',
      subtitle: 'ESP32-driven peristaltic pump state machines for autonomous sampling.',
      content: `
        <h3>Architectural Overview</h3>
        <p class="font-medium">The VARUNA hardware node is a decentralized edge device designed for off-grid operation. It orchestrates a hydraulic sampling chamber using an ESP32 microcontroller, pulling river water through a filtration shroud using a precisely calibrated peristaltic pump.</p>
        
        <div class="my-8 p-6 bg-slate-900 text-teal-400 font-mono text-sm rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_#0f172a] transform -rotate-1 relative" style="background-image: linear-gradient(rgba(20, 184, 166, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(20, 184, 166, 0.1) 1px, transparent 1px); background-size: 20px 20px;">
          <div class="absolute top-2 left-4 text-[10px] text-slate-500 font-black tracking-widest uppercase">Hardware Blueprint // SCH-04A</div>
          <ul class="space-y-3 mt-6">
            <li class="flex items-center gap-3"><span class="w-1.5 h-1.5 bg-rose-500 rounded-full"></span> <strong class="text-white">Sensors:</strong> Analog EC/TDS, Industrial Glass pH, Optical Turbidity, Digital Temp.</li>
            <li class="flex items-center gap-3"><span class="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> <strong class="text-white">Power:</strong> 12V SLA battery backed by a 20W solar array.</li>
            <li class="flex items-center gap-3"><span class="w-1.5 h-1.5 bg-teal-500 rounded-full"></span> <strong class="text-white">Telemetry:</strong> Offline SQLite buffering with Sim800L LTE/4G cloud sync.</li>
          </ul>
        </div>
      `
    },
    'edge-ai-classification': {
      id: 'edge-ai-classification',
      title: 'Edge AI Classification',
      subtitle: 'Sub-second Water Safety inference using Random Forests.',
      content: `
        <h3>From Raw Data to Intelligence</h3>
        <p class="font-medium">Sending raw sensor voltages to the cloud introduces latency and bandwidth costs. VARUNA processes data directly on the edge using a Raspberry Pi 4 Model B.</p>
        
        <div class="my-8 stamp-card p-6 bg-amber-50 border-amber-900/50 shadow-[4px_4px_0px_0px_#78350f]">
          <h4 class="font-black text-amber-900 uppercase tracking-widest text-xs border-b-2 border-amber-900/20 pb-2 mb-4">SHAP Feature Importance Annotations</h4>
          <p class="font-medium text-sm text-amber-900 mb-4">A trained Random Forest classifier ingests the multi-parameter readings. Our 27-feature XGBoost model highlights:</p>
          <div class="flex flex-wrap gap-3 font-mono font-black text-[11px] text-slate-900">
            <span class="highlighter-teal">CHL 39.53%</span>
            <span class="highlighter-amber">Latitude 24.49%</span>
            <span class="highlighter-amber">Longitude 12.25%</span>
            <span class="highlighter-teal">KD490 10.22%</span>
          </div>
        </div>
        <p class="font-medium">This determines the sub-index WQI formulations and immediately flags 'Safe', 'Moderate', or 'Dangerous' states without requiring cloud consensus.</p>
      `
    },
    'optical-particle-screener': {
      id: 'optical-particle-screener',
      title: 'Optical Particle Screener',
      subtitle: 'Computer Vision in turbid waters using morphological contour extraction.',
      content: `
        <h3>Micro-Debris Analysis</h3>
        <p class="font-medium">Using a Pi Camera v3 HDR module under a darkfield LED ring, the system captures localized high-resolution frames of the optical chamber.</p>
        
        <div class="my-8 mx-auto w-64 bg-white p-4 pb-12 border-2 border-slate-900 shadow-[6px_6px_0px_0px_#0f172a] transform rotate-2 relative">
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-red-500/20 rotate-[-4deg] border border-red-500/30"></div>
          <div class="aspect-square bg-slate-900 w-full relative overflow-hidden flex items-center justify-center border-2 border-slate-900">
            <div class="absolute inset-0 border-4 border-green-500/50 m-4 border-dashed rounded-lg flex items-start p-1">
              <span class="bg-green-500 text-black text-[8px] font-mono font-black px-1 uppercase">YOLOv8 DETECT</span>
            </div>
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-rose-500 w-8 h-8 rounded-full flex items-start justify-end p-0.5">
               <span class="bg-rose-500 text-white text-[6px] font-mono font-black px-1 uppercase">1.2mm</span>
            </div>
          </div>
          <div class="absolute bottom-3 left-0 w-full text-center font-mono font-black text-xs text-slate-700 uppercase tracking-widest">
            Sample #0492
          </div>
        </div>
        
        <p class="font-medium">We deploy an OpenCV pipeline utilizing an adaptive Gaussian threshold and morphological contour extraction to dynamically calculate average particle sizes (mm) based on a calibrated pixel ratio (1 px = 0.045 mm).</p>
      `
    },
    'gis-river-mapping': {
      id: 'gis-river-mapping',
      title: 'GIS Geospatial Mapping',
      subtitle: 'Interactive Leaflet maps tracking node health across the basin.',
      content: `
        <h3>Basin-Wide Intelligence</h3>
        <p class="font-medium">The dashboard utilizes Leaflet GIS mapping integrated with CartoDB Dark Matter tiles. Each node acts as a geospatial entity transmitting its live GPS coordinates and health status.</p>
        <p class="font-medium mt-4">The system visualizes safety states via pulsing colored markers and variable coverage radius circles, allowing municipal engineers to instantly locate toxic plumes traversing downstream.</p>
      `
    },
    'automated-alert-gateway': {
      id: 'automated-alert-gateway',
      title: 'Automated Alert Gateway',
      subtitle: '< 3-second alert routing via WhatsApp Cloud API and SMS.',
      content: `
        <h3>Instant Incident Response</h3>
        <p class="font-medium">When the Edge AI model flags a 'Dangerous' state, the node bypasses standard polling intervals and triggers an emergency HTTP webhook.</p>
        <p class="font-medium mt-4">The cloud backend instantly parses the payload and dispatches localized alerts via the Meta WhatsApp Cloud API and Twilio SMS, delivering actionable coordinates and parameters to the designated municipal engineers in under 3 seconds.</p>
      `
    }
  };

  constructor(
    private route: ActivatedRoute,
    private seoService: SeoService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.featureId = params.get('id') || '';
      this.feature = this.featuresDB[this.featureId];
      
      this.otherFeatures = Object.values(this.featuresDB).filter(f => f.id !== this.featureId);

      if (this.feature) {
        this.seoService.updateMetaTags({
          title: this.feature.title,
          description: this.feature.subtitle,
          canonicalUrl: `https://varuna-iot.org/features/${this.feature.id}`
        });
      }
    });
  }
}
