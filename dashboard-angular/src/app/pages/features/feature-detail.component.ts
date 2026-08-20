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
    <div class="bg-white py-12 md:py-20" *ngIf="feature">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <app-breadcrumbs [crumbs]="[
          {label: 'Technology Features', path: '/features'},
          {label: feature.title, path: '/features/' + feature.id}
        ]"></app-breadcrumbs>
        
        <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">{{ feature.title }}</h1>
        <p class="text-xl text-slate-600 mb-12">{{ feature.subtitle }}</p>

        <div class="prose prose-lg prose-cyan text-slate-600 max-w-none">
          <div [innerHTML]="feature.content"></div>
        </div>
        
        <div class="mt-16 pt-8 border-t border-slate-200">
          <h3 class="text-lg font-bold text-slate-900 mb-4">Explore Other Technologies</h3>
          <div class="flex flex-wrap gap-3">
            <a *ngFor="let link of otherFeatures" [routerLink]="'/features/' + link.id" class="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-cyan-600 hover:bg-cyan-50 transition">
              {{ link.title }}
            </a>
          </div>
        </div>
      </div>
    </div>
    
    <div class="bg-white py-20 text-center" *ngIf="!feature">
      <h2 class="text-2xl font-bold text-slate-900">Feature not found</h2>
      <a routerLink="/" class="text-cyan-600 hover:underline mt-4 inline-block">Return Home</a>
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
      title: 'IoT Hardware Node & Sampling Chamber',
      subtitle: 'ESP32-driven peristaltic pump state machines for autonomous sampling.',
      content: `
        <h3>Architectural Overview</h3>
        <p>The VARUNA hardware node is a decentralized edge device designed for off-grid operation. It orchestrates a hydraulic sampling chamber using an ESP32 microcontroller, pulling river water through a filtration shroud using a precisely calibrated peristaltic pump.</p>
        <ul>
          <li><strong>Sensors:</strong> Analog EC/TDS (Platinum K=1.0), Industrial Glass pH (E-201-C), Optical Turbidity (TS-300B), and Digital Temp (DS18B20).</li>
          <li><strong>Power:</strong> 12V SLA battery backed by a 20W solar array.</li>
          <li><strong>Telemetry:</strong> Offline SQLite buffering with Sim800L LTE/4G cloud sync via MQTT/REST.</li>
        </ul>
      `
    },
    'edge-ai-classification': {
      id: 'edge-ai-classification',
      title: 'Edge AI Classification Pipeline',
      subtitle: 'Sub-second Water Safety inference using Random Forests.',
      content: `
        <h3>From Raw Data to Intelligence</h3>
        <p>Sending raw sensor voltages to the cloud introduces latency and bandwidth costs. VARUNA processes data directly on the edge using a Raspberry Pi 4 Model B.</p>
        <p>A trained Random Forest classifier ingests the multi-parameter readings and outputs a normalized <strong>0–100 Water Safety Score</strong>. This determines the sub-index WQI formulations and immediately flags 'Safe', 'Moderate', or 'Dangerous' states without requiring cloud consensus.</p>
      `
    },
    'optical-particle-screener': {
      id: 'optical-particle-screener',
      title: 'Optical Particle Screener',
      subtitle: 'Computer Vision in turbid waters using morphological contour extraction.',
      content: `
        <h3>Micro-Debris Analysis</h3>
        <p>Using a Pi Camera v3 HDR module under a darkfield LED ring, the system captures localized high-resolution frames of the optical chamber.</p>
        <p>We deploy an OpenCV pipeline utilizing an adaptive Gaussian threshold and morphological contour extraction to dynamically calculate average particle sizes (mm) based on a calibrated pixel ratio (1 px = 0.045 mm). This detects micro-plastics and suspended organic debris missed by standard optical turbidity sensors.</p>
      `
    },
    'gis-river-mapping': {
      id: 'gis-river-mapping',
      title: 'GIS Geospatial Telemetry Mapping',
      subtitle: 'Interactive Leaflet maps tracking node health across the basin.',
      content: `
        <h3>Basin-Wide Intelligence</h3>
        <p>The dashboard utilizes Leaflet GIS mapping integrated with CartoDB Dark Matter tiles. Each node acts as a geospatial entity transmitting its live GPS coordinates and health status.</p>
        <p>The system visualizes safety states via pulsing colored markers and variable coverage radius circles, allowing municipal engineers to instantly locate toxic plumes traversing downstream.</p>
      `
    },
    'automated-alert-gateway': {
      id: 'automated-alert-gateway',
      title: 'Automated Emergency Alert Gateway',
      subtitle: '< 3-second alert routing via WhatsApp Cloud API and SMS.',
      content: `
        <h3>Instant Incident Response</h3>
        <p>When the Edge AI model flags a 'Dangerous' state, the node bypasses standard polling intervals and triggers an emergency HTTP webhook.</p>
        <p>The cloud backend instantly parses the payload and dispatches localized alerts via the Meta WhatsApp Cloud API and Twilio SMS, delivering actionable coordinates and parameters to the designated municipal engineers in under 3 seconds.</p>
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
