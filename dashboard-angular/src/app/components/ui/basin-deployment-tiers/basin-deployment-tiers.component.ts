import { Component, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BasinTier {
  name: string;
  tagline: string;
  monthlyCost: number;
  billingPeriod: string;
  popular?: boolean;
  badgeText?: string;
  accentColor: 'teal' | 'amber' | 'purple';
  iconSvg: string;
  hardwareSpecs: string[];
  features: string[];
  actionLabel: string;
}

@Component({
  selector: 'app-basin-deployment-tiers',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="py-12 px-4 bg-slate-50 w-full overflow-hidden">
      <div class="max-w-7xl mx-auto">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <h2 class="text-4xl font-black text-slate-900 tracking-tight">Basin Deployment Tiers</h2>
          <p class="mt-4 text-slate-700 font-bold text-sm">
            Scale your edge intelligence from community streams to state-wide river basins with Project JalDrishti. 
            Select a hardware and telemetry package below.
          </p>
        </div>

        <div class="flex flex-col lg:flex-row gap-8 items-stretch justify-center relative z-10">
          
          <ng-container *ngFor="let tier of tiers; let i = index">
            <div class="flex-1 flex" 
                 [ngClass]="{
                   'lg:-mt-4 lg:mb-4 relative z-20': tier.popular,
                   'z-10': !tier.popular
                 }">
              
              <div class="w-full bg-white border-2 border-slate-900 rounded-2xl flex flex-col transition-all duration-300 shadow-[4px_4px_0px_0px_#0f172a] relative"
                   [ngClass]="tier.popular ? 'ring-2 ring-amber-400' : ''">
                
                <div *ngIf="tier.badgeText" class="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 border-2 border-slate-900 px-4 py-1 rounded-full font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#0f172a]">
                  {{ tier.badgeText }}
                </div>

                <div class="p-8 border-b-2 border-slate-900 flex-1">
                  <div class="flex items-center gap-4 mb-4">
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a]"
                         [innerHTML]="tier.iconSvg"></div>
                    <div>
                      <h3 class="text-xl font-black text-slate-900 tracking-tight">{{ tier.name }}</h3>
                      <p class="text-xs text-slate-600 font-bold uppercase tracking-wider">{{ tier.tagline }}</p>
                    </div>
                  </div>

                  <div class="my-6">
                    <div class="flex items-baseline gap-1">
                      <span class="text-4xl font-black font-mono text-slate-900">₹{{ tier.monthlyCost }}</span>
                      <span class="text-slate-600 font-bold">/{{ tier.billingPeriod }}</span>
                    </div>
                  </div>

                  <button (click)="selectTier(tier.name)"
                          class="stamp-btn w-full py-3.5 px-6 rounded-xl font-black text-white uppercase tracking-wider transition-all text-sm border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a]"
                          [ngClass]="{
                            'bg-teal-600 hover:bg-teal-700': tier.accentColor === 'teal',
                            'bg-amber-500 hover:bg-amber-600 text-slate-900': tier.accentColor === 'amber',
                            'bg-purple-600 hover:bg-purple-700': tier.accentColor === 'purple'
                          }">
                    {{ tier.actionLabel }}
                  </button>
                </div>

                <div class="p-8 bg-slate-50/80 rounded-b-2xl flex-1 flex flex-col gap-6">
                  <div>
                    <h4 class="text-xs font-black text-slate-900 uppercase tracking-wider mb-4">Hardware Included</h4>
                    <ul class="space-y-3">
                      <li *ngFor="let spec of tier.hardwareSpecs" class="flex items-start gap-2.5">
                        <svg class="w-5 h-5 text-teal-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span class="text-sm text-slate-900 font-bold">{{ spec }}</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 class="text-xs font-black text-slate-900 uppercase tracking-wider mb-4">Platform Features</h4>
                    <ul class="space-y-3">
                      <li *ngFor="let feature of tier.features" class="flex items-start gap-2.5">
                        <svg class="w-5 h-5 text-teal-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
                        <span class="text-sm text-slate-900 font-bold">{{ feature }}</span>
                      </li>
                    </ul>
                  </div>
                </div>

              </div>
            </div>
          </ng-container>

        </div>
      </div>
    </div>
  `
})
export class BasinDeploymentTiersComponent {
  @Output() tierSelected = new EventEmitter<string>();

  selectTier(tierName: string) {
    this.tierSelected.emit(tierName);
  }

  tiers: BasinTier[] = [
    {
      name: 'Community Sentinel',
      tagline: 'Basic water quality edge node.',
      monthlyCost: 2400,
      billingPeriod: 'mo',
      accentColor: 'teal',
      iconSvg: '<svg class="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>',
      hardwareSpecs: [
        '1x ESP32 Solar Edge Node',
        'pH & Turbidity Probes'
      ],
      features: [
        '15-min Cellular Uplink',
        'Standard Safe/Hazard Gauges',
        'Community Web Dashboard',
        'Telegram Alerts'
      ],
      actionLabel: 'Deploy Node'
    },
    {
      name: 'Municipal River Basin',
      tagline: 'Full telemetry & AI bloom forecasting.',
      monthlyCost: 12000,
      billingPeriod: 'mo',
      popular: true,
      badgeText: 'Most Deployed',
      accentColor: 'amber',
      iconSvg: '<svg class="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>',
      hardwareSpecs: [
        '3x LoRa/LTE Edge Nodes',
        'Peristaltic Sampler',
        'Optical Flow Unit'
      ],
      features: [
        '6-Card Edge Sensor Array',
        '48–72h NIRVAAH XGBoost Forecasting',
        'WhatsApp Rate-Limited Incident Dispatch',
        'Automated CPCB Threshold Calibration'
      ],
      actionLabel: 'Upgrade Basin'
    },
    {
      name: 'State Env. Grid',
      tagline: 'Satellite-calibrated enterprise swarm.',
      monthlyCost: 41000,
      billingPeriod: 'mo',
      accentColor: 'purple',
      iconSvg: '<svg class="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>',
      hardwareSpecs: [
        'Full Basin Swarm Array',
        'ISRO EOS-06 Satellite Node',
        'Edge AI Camera Screening Unit'
      ],
      features: [
        'Live Optical Particle Segmentation (YOLOv8)',
        'Satellite Swath Hotspot GIS Integration',
        'LTTB Decimated Time-Series Engine',
        'Dedicated SLA & Multi-User RBAC'
      ],
      actionLabel: 'Contact Sales'
    }
  ];
}
