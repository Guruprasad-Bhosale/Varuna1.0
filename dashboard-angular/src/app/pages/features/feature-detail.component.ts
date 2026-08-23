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
    <div id="technology" class="py-12 md:py-20 scroll-mt-24 bg-slate-50 min-h-screen" *ngIf="feature">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <app-breadcrumbs [crumbs]="[
          {label: 'Technology Features', path: '/features'},
          {label: feature.title, path: '/features/' + feature.id}
        ]"></app-breadcrumbs>
        
        <div class="mt-8 bg-white rounded-2xl border border-slate-200 p-8 md:p-12 shadow-sm">
          <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">{{ feature.title }}</h1>
          <p class="text-lg font-medium text-slate-700 mb-8 border-l-4 border-teal-600 pl-4 py-1 leading-relaxed">{{ feature.subtitle }}</p>

          <div class="prose prose-slate max-w-none text-slate-700 leading-relaxed">
            <div [innerHTML]="feature.content"></div>
          </div>
        </div>
        
        <div class="mt-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h3 class="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-teal-600"></span>
            Explore Engineering Blueprints
          </h3>
          <div class="flex flex-wrap gap-3 mt-4">
            <a *ngFor="let link of otherFeatures" [routerLink]="'/features/' + link.id" class="px-4 py-2 bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-200 transition-colors rounded-xl shadow-sm">
              {{ link.title }}
            </a>
          </div>
        </div>
      </div>
    </div>
    
    <div class="py-20 text-center bg-slate-50 min-h-screen" *ngIf="!feature">
      <div class="bg-white rounded-2xl border border-slate-200 inline-block p-8 mx-auto shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900 mb-4">Blueprint Missing</h2>
        <a routerLink="/" class="bg-teal-600 text-white px-6 py-3 text-sm font-bold transition-colors hover:bg-teal-700 rounded-xl inline-block shadow-sm">Return Home</a>
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
        <h3 class="text-xl font-bold text-slate-900 mb-3">Architectural Overview</h3>
        <p class="font-medium text-slate-700 mb-6">The JalDrishti hardware node is a decentralized edge device designed for off-grid operation. It orchestrates a hydraulic sampling chamber using an ESP32 microcontroller, pulling river water through a filtration shroud using a precisely calibrated peristaltic pump.</p>
        
        <div class="my-6 p-6 bg-slate-900 text-teal-400 font-mono text-sm rounded-xl border border-slate-800 shadow-md">
          <div class="text-xs text-slate-400 font-bold tracking-wider uppercase mb-4">Hardware Blueprint • SCH-04A</div>
          <ul class="space-y-3">
            <li class="flex items-center gap-3"><span class="w-2 h-2 bg-rose-500 rounded-full"></span> <strong class="text-white">Sensors:</strong> Analog EC/TDS, Industrial Glass pH, Optical Turbidity, Digital Temp.</li>
            <li class="flex items-center gap-3"><span class="w-2 h-2 bg-amber-500 rounded-full"></span> <strong class="text-white">Power:</strong> 12V SLA battery backed by a 20W solar array.</li>
            <li class="flex items-center gap-3"><span class="w-2 h-2 bg-teal-500 rounded-full"></span> <strong class="text-white">Telemetry:</strong> Offline SQLite buffering with Sim800L LTE/4G cloud sync.</li>
          </ul>
        </div>
      `
    },
    'edge-ai-classification': {
      id: 'edge-ai-classification',
      title: 'Edge AI Classification',
      subtitle: 'Sub-second Water Safety inference using Random Forests.',
      content: `
        <h3 class="text-xl font-bold text-slate-900 mb-3">From Raw Data to Intelligence</h3>
        <p class="font-medium text-slate-700 mb-6">Sending raw sensor voltages to the cloud introduces latency and bandwidth costs. JalDrishti processes data directly on the edge using a Raspberry Pi 4 Model B.</p>
        
        <div class="my-6 p-6 bg-amber-50/80 rounded-xl border border-amber-200">
          <h4 class="font-bold text-amber-900 uppercase tracking-wider text-xs border-b border-amber-200 pb-2 mb-4">SHAP Feature Importance Annotations</h4>
          <p class="font-medium text-sm text-amber-900 mb-4">A trained Random Forest classifier ingests the multi-parameter readings. Our 27-feature XGBoost model highlights:</p>
          <div class="flex flex-wrap gap-3 font-mono font-bold text-xs">
            <span class="bg-teal-100 text-teal-900 px-2.5 py-1 rounded-lg">CHL 39.53%</span>
            <span class="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg">Latitude 24.49%</span>
            <span class="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg">Longitude 12.25%</span>
            <span class="bg-teal-100 text-teal-900 px-2.5 py-1 rounded-lg">KD490 10.22%</span>
          </div>
        </div>
        <p class="font-medium text-slate-700">This determines the sub-index WQI formulations and immediately flags 'Safe', 'Moderate', or 'Dangerous' states without requiring cloud consensus.</p>
      `
    },
    'optical-particle-screener': {
      id: 'optical-particle-screener',
      title: 'Optical Particle Screener',
      subtitle: 'Computer Vision in turbid waters using morphological contour extraction.',
      content: `
        <h3 class="text-xl font-bold text-slate-900 mb-3">Micro-Debris Analysis</h3>
        <p class="font-medium text-slate-700 mb-6">Using a Pi Camera v3 HDR module under a darkfield LED ring, the system captures localized high-resolution frames of the optical chamber.</p>
        
        <div class="my-6 mx-auto w-64 bg-slate-900 rounded-xl p-4 text-center border border-slate-800 shadow-md">
          <div class="aspect-square bg-slate-950 w-full rounded-lg relative overflow-hidden flex items-center justify-center border border-slate-800">
            <div class="absolute inset-0 border-2 border-teal-500/50 m-4 border-dashed rounded-lg flex items-start p-1">
              <span class="bg-teal-500 text-black text-[8px] font-mono font-bold px-1 rounded uppercase">YOLOv8 DETECT</span>
            </div>
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-rose-500 w-8 h-8 rounded-full flex items-start justify-end p-0.5">
               <span class="bg-rose-500 text-white text-[6px] font-mono font-bold px-1 rounded uppercase">1.2mm</span>
            </div>
          </div>
          <div class="text-center font-mono font-bold text-xs text-slate-400 uppercase tracking-wider mt-3">
            Sample #0492
          </div>
        </div>
        
        <p class="font-medium text-slate-700">We deploy an OpenCV pipeline utilizing an adaptive Gaussian threshold and morphological contour extraction to dynamically calculate average particle sizes (mm) based on a calibrated pixel ratio (1 px = 0.045 mm).</p>
      `
    },
    'gis-river-mapping': {
      id: 'gis-river-mapping',
      title: 'GIS Geospatial Mapping',
      subtitle: 'Interactive Leaflet maps tracking node health across the basin.',
      content: `
        <h3 class="text-xl font-bold text-slate-900 mb-3">Basin-Wide Intelligence</h3>
        <p class="font-medium text-slate-700 mb-4">The dashboard utilizes Leaflet GIS mapping integrated with CartoDB Dark Matter tiles. Each node acts as a geospatial entity transmitting its live GPS coordinates and health status.</p>
        <p class="font-medium text-slate-700">The system visualizes safety states via pulsing colored markers and variable coverage radius circles, allowing municipal engineers to instantly locate toxic plumes traversing downstream.</p>
      `
    },
    'automated-alert-gateway': {
      id: 'automated-alert-gateway',
      title: 'Automated Alert Gateway',
      subtitle: '< 3-second alert routing via WhatsApp Cloud API and SMS.',
      content: `
        <h3 class="text-xl font-bold text-slate-900 mb-3">Instant Incident Response</h3>
        <p class="font-medium text-slate-700 mb-4">When the Edge AI model flags a 'Dangerous' state, the node bypasses standard polling intervals and triggers an emergency HTTP webhook.</p>
        <p class="font-medium text-slate-700">The cloud backend instantly parses the payload and dispatches localized alerts via the Meta WhatsApp Cloud API and Twilio SMS, delivering actionable coordinates and parameters to the designated municipal engineers in under 3 seconds.</p>
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
          canonicalUrl: `https://jaldrishti.org/features/${this.feature.id}`
        });
      }
    });
  }
}

