import { Component, inject, OnInit, computed, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TelemetryService, TelemetryData } from '../../../../services/telemetry.service';
import { ToastService } from '../../../../services/toast.service';
import { TelemetryChartsComponent } from '../../../../components/telemetry-charts/telemetry-charts.component';
import { WavesShaderComponent } from '../../../../components/ui/waves-shader/waves-shader.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface ShapParameterCard {
  rank: number;
  key: string;
  name: string;
  category: 'Bio-Optical' | 'Spatial' | 'Light Attenuation' | 'Temporal' | 'Hydrodynamic' | 'Seasonal';
  shapImportance: number;
  shapLabel: string;
  source: string;
  mechanism: string;
  unit: string;
  standardRange: string;
  minVal: number;
  maxVal: number;
  safeMin?: number;
  safeMax?: number;
  warningMax?: number;
  invertRisk?: boolean;
}

export const TOP_10_SHAP_REGISTRY: ShapParameterCard[] = [
  {
    rank: 1,
    key: 'chl',
    name: 'Chlorophyll-a Concentration',
    category: 'Bio-Optical',
    shapImportance: 39.53,
    shapLabel: 'Primary biological bloom proxy',
    source: 'ISRO EOS-06 OCM / Oceansat-2 (443–681 nm Radiance)',
    mechanism: 'Direct measure of photosynthetic phytoplankton biomass. Levels >2.5 mg/m³ indicate rapid microalgae proliferation, leading to surface scums and nocturnal hypoxia.',
    unit: 'mg/m³',
    standardRange: '0.10 – 2.50 mg/m³',
    minVal: 0,
    maxVal: 20,
    safeMax: 2.5,
    warningMax: 5.0
  },
  {
    rank: 2,
    key: 'lat',
    name: 'Geodetic Latitude',
    category: 'Spatial',
    shapImportance: 24.49,
    shapLabel: 'Regional coastal upwelling zone',
    source: 'Differential GPS / Sindhudurg Basin Grid',
    mechanism: 'Defines latitude-dependent solar radiation angles, coastal bathymetric contours, and proximity to the Gad/Karli estuarine outfall plumes.',
    unit: '° N',
    standardRange: '15.80 – 16.50° N',
    minVal: 15.5,
    maxVal: 16.8
  },
  {
    rank: 3,
    key: 'lng',
    name: 'Geodetic Longitude',
    category: 'Spatial',
    shapImportance: 12.25,
    shapLabel: 'Offshore distance & tidal flush',
    source: 'Differential GPS / Sindhudurg Basin Grid',
    mechanism: 'Governs distance from the continental shelf break. Nearshore coordinates indicate shallower depths with reduced tidal dilution and higher nutrient retention.',
    unit: '° E',
    standardRange: '73.30 – 73.90° E',
    minVal: 73.0,
    maxVal: 74.2
  },
  {
    rank: 4,
    key: 'kd490',
    name: 'Light Attenuation Coefficient [Kd490]',
    category: 'Light Attenuation',
    shapImportance: 10.22,
    shapLabel: 'Photic zone solar absorption',
    source: 'ISRO EOS-06 OCM (490 nm Spectral Band)',
    mechanism: 'Measures rate of blue-green light decay in the water column. High attenuation traps solar energy in the surface layer, triggering rapid thermal stratification.',
    unit: 'm⁻¹',
    standardRange: '0.04 – 0.15 m⁻¹',
    minVal: 0.0,
    maxVal: 0.6,
    safeMax: 0.15,
    warningMax: 0.30
  },
  {
    rank: 5,
    key: 'season',
    name: 'Seasonal Climate Regime',
    category: 'Seasonal',
    shapImportance: 6.20,
    shapLabel: 'Monsoon nutrient runoff cycle',
    source: 'Indian Meteorological Department (IMD) / Calendar Model',
    mechanism: 'Post-Monsoon transition introduces extensive terrestrial nitrate/phosphate runoff combined with clear sunny skies, creating optimal bloom growth conditions.',
    unit: 'Regime',
    standardRange: 'Post-Monsoon (High Risk) / Pre-Monsoon',
    minVal: 1,
    maxVal: 4
  },
  {
    rank: 6,
    key: 'tsm',
    name: 'Total Suspended Matter [TSM]',
    category: 'Bio-Optical',
    shapImportance: 3.39,
    shapLabel: 'Sediment plume vs algae separator',
    source: 'ISRO EOS-06 OCM / Oceansat-2 (670–870 nm)',
    mechanism: 'Quantifies non-algal mineral sediment and inorganic solids. Used in the CHL/TSM ratio to isolate real photosynthetic blooms from muddy sediment plumes.',
    unit: 'g/m³',
    standardRange: '0.50 – 5.00 g/m³',
    minVal: 0,
    maxVal: 25,
    safeMax: 5.0,
    warningMax: 12.0
  },
  {
    rank: 7,
    key: 'doy',
    name: 'Day of Year [DOY]',
    category: 'Temporal',
    shapImportance: 1.42,
    shapLabel: 'Solar photoperiod & diurnal cycle',
    source: 'Astronomical & Ephemeris Clock',
    mechanism: 'Captures continuous 365-day solar elevation cycles, daylight photoperiod duration, and recurring annual coastal upwelling time windows.',
    unit: 'Day',
    standardRange: 'Day 1 – 365',
    minVal: 1,
    maxVal: 365
  },
  {
    rank: 8,
    key: 'waveHeight',
    name: 'Significant Wave Height [Hs]',
    category: 'Hydrodynamic',
    shapImportance: 1.00,
    shapLabel: 'Vertical water-column mixing',
    source: 'Hydrodynamic Marine Wave NetCDF Reanalysis',
    mechanism: 'Mechanical wave energy dilutes surface phytoplankton. Calm waters (<0.8m) create stagnant, warm boundary layers that allow bloom colonies to form surface slicks.',
    unit: 'm',
    standardRange: '1.00 – 3.50 m (Optimal Mixing)',
    minVal: 0.1,
    maxVal: 4.0,
    safeMin: 1.0,
    invertRisk: true
  },
  {
    rank: 9,
    key: 'month',
    name: 'Calendar Month',
    category: 'Temporal',
    shapImportance: 0.84,
    shapLabel: 'Sea surface thermal baseline',
    source: 'System Temporal Timestamp',
    mechanism: 'Maps monthly sea surface temperature (SST) baselines and localized trade-wind circulation patterns along the Konkan coast.',
    unit: 'Month',
    standardRange: 'Jan (1) – Dec (12)',
    minVal: 1,
    maxVal: 12
  },
  {
    rank: 10,
    key: 'year',
    name: 'Observation Epoch Year',
    category: 'Temporal',
    shapImportance: 0.25,
    shapLabel: 'Long-term decadal climatic shift',
    source: 'Historical Satellite Decadal Baseline',
    mechanism: 'Accounts for multi-year oceanic warming trends, Indian Ocean Dipole (IOD) positive phases, and long-term Arabian Sea environmental shifts.',
    unit: 'Year',
    standardRange: '2024 – 2026 Epoch',
    minVal: 2020,
    maxVal: 2030
  }
];

@Component({
  selector: 'app-live-monitoring-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TelemetryChartsComponent],
  template: `
    <div class="space-y-6 animate-stagger-1">
      
      <!-- Top Action Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Live Telemetry Stream</span>
            <span class="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </h2>
          <p class="text-xs text-slate-700 font-bold mt-0.5">Real-time edge IoT sensor array telemetry and multi-factor water safety index</p>
        </div>

        <div class="flex items-center gap-2 bg-white p-2 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a] shrink-0">
          <span class="text-xs font-black uppercase text-slate-900 px-1">Simulate:</span>
          <button (click)="simulate('dump')" class="stamp-btn px-3 py-1.5 rounded-xl text-xs font-black bg-rose-50 text-rose-800 hover:bg-rose-100 border-2 border-slate-900 transition-all">Industrial Dump</button>
          <button (click)="simulate('rain')" class="stamp-btn px-3 py-1.5 rounded-xl text-xs font-black bg-sky-50 text-sky-800 hover:bg-sky-100 border-2 border-slate-900 transition-all">Heavy Rain</button>
          <button (click)="simulate('alkaline')" class="stamp-btn px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-2 border-slate-900 transition-all">Alkaline Spill</button>
        </div>
      </div>

      <!-- Station Hero Summary Card -->
      @if (telemetry(); as data) {
        <div class="stamp-card p-6 sm:p-8 bg-white relative animate-stagger-2">
          <div class="washi-tape-top"></div>
          
          <div class="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div class="space-y-4 w-full lg:w-auto">
              <div class="flex flex-wrap items-center gap-3">
                <span *ngIf="data.status === 'SAFE'" class="rubber-stamp-resolved">
                  CPCB CLASS-A // NOMINAL
                </span>
                <span *ngIf="data.status !== 'SAFE'" class="rubber-stamp-dispatched">
                  CRITICAL HAZARD DETECTED
                </span>
                <span class="text-xs text-slate-700 font-bold">Suitable under current monitored conditions</span>
              </div>

              <div class="w-full lg:w-[450px]">
                <div class="flex items-center gap-3 mb-2 relative">
                  <div class="relative w-3 h-3 shrink-0">
                     <div class="absolute inset-0 rounded-full" [ngClass]="data.status === 'HAZARD' ? 'bg-rose-500' : (data.status === 'MODERATE' ? 'bg-amber-500' : 'bg-emerald-500')"></div>
                     <div class="absolute inset-0 rounded-full animate-live-ripple" [ngClass]="data.status === 'HAZARD' ? 'bg-rose-500' : (data.status === 'MODERATE' ? 'bg-amber-500' : 'bg-emerald-500')"></div>
                  </div>
                  <div class="relative inline-block w-full">
                    <h3 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {{ data.nodeId }} ({{ data.locationName }})
                    </h3>
                  </div>
                </div>
                <p class="text-xs text-slate-600 font-semibold mt-2">Autonomous Multi-Parameter Solar Buoy • Firmware v2.4.1</p>
              </div>

              <div class="flex flex-wrap items-center gap-4 text-xs font-black text-slate-800">
                <span class="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-2.5 py-1 rounded-lg">
                  <svg class="h-4 w-4 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                  16.2699° N, 73.7148° E
                </span>
                <span class="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-2.5 py-1 rounded-lg">
                  <svg class="h-4 w-4 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.393 9.393c5.857-5.857 15.355-5.857 21.213 0"/></svg>
                  Cellular LTE Active
                </span>
                <span class="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-2.5 py-1 rounded-lg">
                  <svg class="h-4 w-4 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  Sync: {{ data.timestamp }}
                </span>
              </div>
            </div>

            <!-- Animated Radial Gauge -->
            <div class="flex items-center gap-5 bg-slate-50 border-2 border-slate-900 p-5 rounded-2xl w-full lg:w-80 justify-between shrink-0 shadow-[4px_4px_0px_0px_#0f172a] transition-all duration-500"
                 [ngClass]="data.status === 'HAZARD' ? 'border-rose-700 bg-rose-50' : ''">
              <div>
                <div class="text-[10px] font-black uppercase tracking-wider text-slate-500">Water Safety Score</div>
                <div class="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight flex items-baseline gap-1 mt-1">
                  <span class="transition-all duration-700">{{ data.compositeScore | number:'1.1-1' }}</span>
                  <span class="text-sm font-bold text-slate-500">/100</span>
                </div>
                <div class="text-xs font-black mt-1 uppercase tracking-wider" [ngClass]="data.compositeScore >= 75 ? 'text-teal-800' : 'text-rose-700'">
                  {{ data.confidence }}% confidence
                </div>
                <div class="text-[10px] text-slate-700 uppercase font-mono font-black tracking-wider mt-1">NIRVAAH XGBoost</div>
              </div>

              <div class="relative h-20 w-20 flex items-center justify-center shrink-0">
                <svg class="h-full w-full -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="26" stroke-width="5" stroke="#cbd5e1" fill="none" />
                  <circle cx="32" cy="32" r="26" 
                          stroke-width="5" 
                          stroke-linecap="round" 
                          fill="none" 
                          [attr.stroke]="data.compositeScore >= 75 ? '#0d9488' : '#e11d48'"
                          stroke-dasharray="163.36" 
                          [style.strokeDashoffset]="163.36 - (163.36 * (data.compositeScore / 100))"
                          class="gauge-stroke-transition" />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center transition-all duration-500">
                  <svg *ngIf="data.compositeScore >= 75" class="w-7 h-7 text-teal-700 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <svg *ngIf="data.compositeScore < 75" class="w-7 h-7 text-rose-600 animate-pulse stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Spatial-Temporal Ephemeris Ribbon -->
        <div class="stamp-card p-4 bg-white flex flex-wrap items-center gap-4 animate-stagger-2 text-xs">
          <div class="font-black text-slate-900 uppercase tracking-wider mr-2">Ephemeris Metadata:</div>
          
          <div class="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-300">
            <span class="font-bold text-slate-700">Latitude:</span>
            <span class="font-mono font-black text-slate-900">{{ data.coordinates.lat }}° N</span>
            <span class="text-[10px] text-slate-600 font-bold">(#2 • 24.49%)</span>
          </div>

          <div class="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-300">
            <span class="font-bold text-slate-700">Longitude:</span>
            <span class="font-mono font-black text-slate-900">{{ data.coordinates.lng }}° E</span>
            <span class="text-[10px] text-slate-600 font-bold">(#3 • 12.25%)</span>
          </div>

          <div class="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-300">
            <span class="font-bold text-amber-900">Season:</span>
            <span class="font-black text-amber-950">Post-Monsoon (High Risk)</span>
            <span class="text-[10px] text-amber-900 font-bold">(#5 • 6.20%)</span>
          </div>

          <div class="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-300">
            <span class="font-bold text-slate-700">Day of Year:</span>
            <span class="font-mono font-black text-slate-900">DOY {{ dayOfYear() }}</span>
            <span class="text-[10px] text-slate-600 font-bold">(#7 • 1.42%)</span>
          </div>

          <div class="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-300">
            <span class="font-bold text-slate-700">Epoch:</span>
            <span class="font-black text-slate-900">{{ currentEpoch() }}</span>
            <span class="text-[10px] text-slate-600 font-bold">(#9 & #10 • 1.09%)</span>
          </div>
        </div>

        <!-- Complete 6-Card Edge Sensor Array -->
        <div class="animate-stagger-3">
          <div class="text-xs font-black uppercase tracking-wider text-slate-900 mb-3 flex justify-between items-center">
            <span>01 // Edge Sensor Specimen Grid</span>
            <span class="text-[11px] font-bold text-slate-600 normal-case">Click a card to filter historical trends</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            
            <!-- 1. pH Level -->
            <div (click)="selectMetric('ph')" class="stamp-card p-5 bg-white cursor-pointer relative group space-y-2"
                 [ngClass]="selectedMetric() === 'ph' ? 'ring-4 ring-teal-500' : ''">
              <div class="flex items-center justify-between text-[11px] font-mono font-bold text-slate-500 uppercase">
                <div class="flex items-center gap-1.5 group/tooltip relative">
                  <span class="text-slate-900 font-black">01 / pH PROBE</span>
                  <button type="button" class="text-slate-400 hover:text-slate-700 p-0.5" aria-label="Info">
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 16v-4"></path>
                      <path d="M12 8h.01"></path>
                    </svg>
                  </button>
                  <!-- Rich Glassmorphic Tooltip Card -->
                  <div class="pointer-events-none absolute bottom-full left-0 mb-2 hidden w-72 rounded-xl bg-slate-950 p-4 text-[11px] text-slate-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border-2 border-slate-700 group-hover/tooltip:block z-[1200] font-sans">
                    <div class="font-black text-teal-400 mb-2 flex items-center justify-between uppercase border-b border-slate-800 pb-2">
                      <span class="tracking-widest">pH Level</span>
                    </div>
                    <div class="text-slate-300 mb-3 leading-relaxed font-medium normal-case">
                      Measures the acidic or basic nature of the water. Sudden drops can indicate industrial acidic discharge, while spikes may suggest alkaline spills or excessive algal photosynthesis.
                    </div>
                    <div class="bg-slate-900 rounded-lg p-2.5 mb-2 border border-slate-800">
                      <div class="flex items-center justify-between mb-1">
                        <span class="font-bold text-slate-400 text-[10px] uppercase">Guideline Standard</span>
                        <span class="font-mono text-emerald-400 font-black text-xs">6.5 - 8.5</span>
                      </div>
                      <p class="text-[10px] text-slate-400 leading-tight normal-case">
                        According to the <span class="text-white font-bold">WHO Guidelines for Drinking-water Quality</span>, pH levels must be maintained in this range to ensure palatability and reduce corrosivity.
                      </p>
                    </div>
                  </div>
                </div>
                <span class="px-2 py-0.5 rounded border font-extrabold text-[10px]"
                      [ngClass]="phStatus().border + ' ' + phStatus().bg + ' ' + phStatus().textCol">
                  {{ phStatus().text }}
                </span>
              </div>
              <div class="text-3xl sm:text-4xl font-black font-mono text-slate-900 my-1">
                {{ (data.ph || 7.42) | number:'1.2-2' }} <span class="text-xs font-semibold text-slate-500 font-sans">pH</span>
              </div>
              <div class="w-full bg-slate-100 h-2 rounded-full border border-slate-200 overflow-hidden">
                <div [class]="phColor() + ' h-full rounded-full transition-all duration-700'" [style.width.%]="phPct()"></div>
              </div>
              <div class="text-[10px] font-mono font-bold text-slate-600 flex justify-between">
                <span>Min: 6.5</span>
                <span>Max: 8.5</span>
              </div>
            </div>

            <!-- 2. Turbidity -->
            <div (click)="selectMetric('turbidity_ntu')" class="stamp-card p-5 bg-white cursor-pointer relative group space-y-2"
                 [ngClass]="selectedMetric() === 'turbidity_ntu' ? 'ring-4 ring-teal-500' : ''">
              <div class="flex items-center justify-between text-[11px] font-mono font-bold text-slate-500 uppercase">
                <div class="flex items-center gap-1.5 group/tooltip relative">
                  <span class="text-slate-900 font-black">02 / TURBIDITY</span>
                  <button type="button" class="text-slate-400 hover:text-slate-700 p-0.5" aria-label="Info">
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 16v-4"></path>
                      <path d="M12 8h.01"></path>
                    </svg>
                  </button>
                  <!-- Rich Glassmorphic Tooltip Card -->
                  <div class="pointer-events-none absolute bottom-full left-0 mb-2 hidden w-72 rounded-xl bg-slate-950 p-4 text-[11px] text-slate-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border-2 border-slate-700 group-hover/tooltip:block z-[1200] font-sans">
                    <div class="font-black text-teal-400 mb-2 flex items-center justify-between uppercase border-b border-slate-800 pb-2">
                      <span class="tracking-widest">Turbidity (NTU)</span>
                    </div>
                    <div class="text-slate-300 mb-3 leading-relaxed font-medium normal-case">
                      Quantifies the loss of water transparency due to suspended particulates. High values block sunlight, disrupting aquatic plant life and indicating potential agricultural runoff or soil erosion.
                    </div>
                    <div class="bg-slate-900 rounded-lg p-2.5 mb-2 border border-slate-800">
                      <div class="flex items-center justify-between mb-1">
                        <span class="font-bold text-slate-400 text-[10px] uppercase">Guideline Standard</span>
                        <span class="font-mono text-emerald-400 font-black text-xs">Max 10.0</span>
                      </div>
                      <p class="text-[10px] text-slate-400 leading-tight normal-case">
                        According to <span class="text-white font-bold">BIS IS 10500:2012</span>, turbidity should not exceed this threshold to ensure microbiological safety.
                      </p>
                    </div>
                  </div>
                </div>
                <span class="px-2 py-0.5 rounded border font-extrabold text-[10px]"
                      [ngClass]="turbidityStatus().border + ' ' + turbidityStatus().bg + ' ' + turbidityStatus().textCol">
                  {{ turbidityStatus().text }}
                </span>
              </div>
              <div class="text-3xl sm:text-4xl font-black font-mono text-slate-900 my-1">
                {{ (data.turbidity_ntu || data.turbidity || 4.80) | number:'1.2-2' }} <span class="text-xs font-semibold text-slate-500 font-sans">NTU</span>
              </div>
              <div class="w-full bg-slate-100 h-2 rounded-full border border-slate-200 overflow-hidden">
                <div [class]="turbidityColor() + ' h-full rounded-full transition-all duration-700'" [style.width.%]="turbidityPct()"></div>
              </div>
              <div class="text-[10px] font-mono font-bold text-slate-600 flex justify-between">
                <span>Min: 0.0</span>
                <span>Limit: 10.0 NTU</span>
              </div>
            </div>

            <!-- 3. Electrical Conductivity (EC) -->
            <div (click)="selectMetric('ec_us_cm')" class="stamp-card p-5 bg-white cursor-pointer relative group space-y-2"
                 [ngClass]="selectedMetric() === 'ec_us_cm' ? 'ring-4 ring-teal-500' : ''">
              <div class="flex items-center justify-between text-[11px] font-mono font-bold text-slate-500 uppercase">
                <div class="flex items-center gap-1.5 group/tooltip relative">
                  <span class="text-slate-900 font-black">03 / CONDUCTIVITY (EC)</span>
                  <button type="button" class="text-slate-400 hover:text-slate-700 p-0.5" aria-label="Info">
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 16v-4"></path>
                      <path d="M12 8h.01"></path>
                    </svg>
                  </button>
                  <!-- Rich Glassmorphic Tooltip Card -->
                  <div class="pointer-events-none absolute bottom-full right-0 md:left-0 xl:right-0 mb-2 hidden w-72 rounded-xl bg-slate-950 p-4 text-[11px] text-slate-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border-2 border-slate-700 group-hover/tooltip:block z-[1200] font-sans">
                    <div class="font-black text-teal-400 mb-2 flex items-center justify-between uppercase border-b border-slate-800 pb-2">
                      <span class="tracking-widest">Electrical Conductivity</span>
                    </div>
                    <div class="text-slate-300 mb-3 leading-relaxed font-medium normal-case">
                      Measures the water's ability to conduct electrical current, which scales directly with dissolved salts, minerals, and heavy metals. Sudden spikes are strong indicators of untreated sewage or chemical dumping.
                    </div>
                    <div class="bg-slate-900 rounded-lg p-2.5 mb-2 border border-slate-800">
                      <div class="flex items-center justify-between mb-1">
                        <span class="font-bold text-slate-400 text-[10px] uppercase">Guideline Standard</span>
                        <span class="font-mono text-emerald-400 font-black text-xs">Max 600 µS</span>
                      </div>
                      <p class="text-[10px] text-slate-400 leading-tight normal-case">
                        Based on <span class="text-white font-bold">WHO Drinking-water Palatability Limits</span>, prolonged exposure above this indicates severe contamination.
                      </p>
                    </div>
                  </div>
                </div>
                <span class="px-2 py-0.5 rounded border font-extrabold text-[10px]"
                      [ngClass]="ecStatus().border + ' ' + ecStatus().bg + ' ' + ecStatus().textCol">
                  {{ ecStatus().text }}
                </span>
              </div>
              <div class="text-3xl sm:text-4xl font-black font-mono text-slate-900 my-1">
                {{ (data.ec_us_cm || data.ec || 420) | number:'1.0-0' }} <span class="text-xs font-semibold text-slate-500 font-sans">&micro;S/cm</span>
              </div>
              <div class="w-full bg-slate-100 h-2 rounded-full border border-slate-200 overflow-hidden">
                <div [class]="ecColor() + ' h-full rounded-full transition-all duration-700'" [style.width.%]="ecPct()"></div>
              </div>
              <div class="text-[10px] font-mono font-bold text-slate-600 flex justify-between">
                <span>Min: 50</span>
                <span>Limit: 600 &micro;S/cm</span>
              </div>
            </div>

            <!-- 4. Water Temperature -->
            <div (click)="selectMetric('temperature')" class="stamp-card p-5 bg-white cursor-pointer relative group space-y-2"
                 [ngClass]="selectedMetric() === 'temperature' ? 'ring-4 ring-teal-500' : ''">
              <div class="flex items-center justify-between text-[11px] font-mono font-bold text-slate-500 uppercase">
                <div class="flex items-center gap-1.5 group/tooltip relative">
                  <span class="text-slate-900 font-black">04 / TEMPERATURE</span>
                  <button type="button" class="text-slate-400 hover:text-slate-700 p-0.5" aria-label="Info">
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 16v-4"></path>
                      <path d="M12 8h.01"></path>
                    </svg>
                  </button>
                  <!-- Rich Glassmorphic Tooltip Card -->
                  <div class="pointer-events-none absolute bottom-full left-0 mb-2 hidden w-72 rounded-xl bg-slate-950 p-4 text-[11px] text-slate-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border-2 border-slate-700 group-hover/tooltip:block z-[1200] font-sans">
                    <div class="font-black text-teal-400 mb-2 flex items-center justify-between uppercase border-b border-slate-800 pb-2">
                      <span class="tracking-widest">Water Temperature</span>
                    </div>
                    <div class="text-slate-300 mb-3 leading-relaxed font-medium normal-case">
                      Controls the rate of metabolic and reproductive activities in aquatic life. Elevated temperatures reduce dissolved oxygen capacity and can trigger harmful algal blooms.
                    </div>
                    <div class="bg-slate-900 rounded-lg p-2.5 mb-2 border border-slate-800">
                      <div class="flex items-center justify-between mb-1">
                        <span class="font-bold text-slate-400 text-[10px] uppercase">Guideline Standard</span>
                        <span class="font-mono text-emerald-400 font-black text-xs">18°C - 28°C</span>
                      </div>
                      <p class="text-[10px] text-slate-400 leading-tight normal-case">
                        Adheres to <span class="text-white font-bold">CPCB Class-A River Standards</span> for maintaining healthy aquatic ecosystems and limiting algal bloom outbreaks.
                      </p>
                    </div>
                  </div>
                </div>
                <span class="px-2 py-0.5 rounded border font-extrabold text-[10px]"
                      [ngClass]="tempStatus().border + ' ' + tempStatus().bg + ' ' + tempStatus().textCol">
                  {{ tempStatus().text }}
                </span>
              </div>
              <div class="text-3xl sm:text-4xl font-black font-mono text-slate-900 my-1">
                {{ (data.temp_c || data.temperature || 24.6) | number:'1.1-1' }} <span class="text-xs font-semibold text-slate-500 font-sans">&deg;C</span>
              </div>
              <div class="w-full bg-slate-100 h-2 rounded-full border border-slate-200 overflow-hidden">
                <div [class]="tempColor() + ' h-full rounded-full transition-all duration-700'" [style.width.%]="tempPct()"></div>
              </div>
              <div class="text-[10px] font-mono font-bold text-slate-600 flex justify-between">
                <span>Nominal: 18.0 &deg;C</span>
                <span>Max: 28.0 &deg;C</span>
              </div>
            </div>

            <!-- 5. Optical Particulates -->
            <div (click)="selectMetric('optical_count')" class="stamp-card p-5 bg-white cursor-pointer relative group space-y-2"
                 [ngClass]="selectedMetric() === 'optical_count' ? 'ring-4 ring-teal-500' : ''">
              <div class="flex items-center justify-between text-[11px] font-mono font-bold text-slate-500 uppercase">
                <div class="flex items-center gap-1.5 group/tooltip relative">
                  <span class="text-slate-900 font-black">05 / PARTICULATES</span>
                  <button type="button" class="text-slate-400 hover:text-slate-700 p-0.5" aria-label="Info">
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 16v-4"></path>
                      <path d="M12 8h.01"></path>
                    </svg>
                  </button>
                  <!-- Rich Glassmorphic Tooltip Card -->
                  <div class="pointer-events-none absolute bottom-full left-0 mb-2 hidden w-72 rounded-xl bg-slate-950 p-4 text-[11px] text-slate-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border-2 border-slate-700 group-hover/tooltip:block z-[1200] font-sans">
                    <div class="font-black text-teal-400 mb-2 flex items-center justify-between uppercase border-b border-slate-800 pb-2">
                      <span class="tracking-widest">Suspended Particulates</span>
                    </div>
                    <div class="text-slate-300 mb-3 leading-relaxed font-medium normal-case">
                      AI-powered computer vision count of distinct particles per sample volume. Specifically trained to identify microplastics, silt clusters, and visible contaminants in real-time.
                    </div>
                    <div class="bg-slate-900 rounded-lg p-2.5 mb-2 border border-slate-800">
                      <div class="flex items-center justify-between mb-1">
                        <span class="font-bold text-slate-400 text-[10px] uppercase">Guideline Standard</span>
                        <span class="font-mono text-emerald-400 font-black text-xs">Monitor</span>
                      </div>
                      <p class="text-[10px] text-slate-400 leading-tight normal-case">
                        References <span class="text-white font-bold">WHO Microplastics in Drinking-water (2019)</span> reporting protocols for evaluating contamination risk in raw surface water.
                      </p>
                    </div>
                  </div>
                </div>
                <span class="px-2 py-0.5 rounded border font-extrabold text-[10px]"
                      [ngClass]="opticalStatus().border + ' ' + opticalStatus().bg + ' ' + opticalStatus().textCol">
                  {{ opticalStatus().text }}
                </span>
              </div>
              <div class="text-3xl sm:text-4xl font-black font-mono text-slate-900 my-1">
                {{ data.optical_count || data.opticalParticulates || 132 }} <span class="text-xs font-semibold text-slate-500 font-sans">count</span>
              </div>
              <div class="w-full bg-slate-100 h-2 rounded-full border border-slate-200 overflow-hidden">
                <div [class]="opticalColor() + ' h-full rounded-full transition-all duration-700'" [style.width.%]="opticalPct()"></div>
              </div>
              <div class="text-[10px] font-mono font-bold text-slate-600 flex justify-between">
                <span>Microplastic & Silt</span>
                <span>Limit: 100 count</span>
              </div>
            </div>

            <!-- 6. Avg Particle Size / Optical Clarity -->
            <div (click)="selectMetric('avg_particle_size')" class="stamp-card p-5 bg-white cursor-pointer relative group space-y-2"
                 [ngClass]="selectedMetric() === 'avg_particle_size' ? 'ring-4 ring-teal-500' : ''">
              <div class="flex items-center justify-between text-[11px] font-mono font-bold text-slate-500 uppercase">
                <div class="flex items-center gap-1.5 group/tooltip relative">
                  <span class="text-slate-900 font-black">06 / OPTICAL CLARITY</span>
                  <button type="button" class="text-slate-400 hover:text-slate-700 p-0.5" aria-label="Info">
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 16v-4"></path>
                      <path d="M12 8h.01"></path>
                    </svg>
                  </button>
                  <!-- Rich Glassmorphic Tooltip Card -->
                  <div class="pointer-events-none absolute bottom-full right-0 mb-2 hidden w-72 rounded-xl bg-slate-950 p-4 text-[11px] text-slate-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border-2 border-slate-700 group-hover/tooltip:block z-[1200] font-sans">
                    <div class="font-black text-teal-400 mb-2 flex items-center justify-between uppercase border-b border-slate-800 pb-2">
                      <span class="tracking-widest">Optical Clarity Index</span>
                    </div>
                    <div class="text-slate-300 mb-3 leading-relaxed font-medium normal-case">
                      A composite visual clarity score derived from average particle size and distribution. A higher index indicates visually pristine water, while lower scores reflect murky, contaminated flows.
                    </div>
                    <div class="bg-slate-900 rounded-lg p-2.5 mb-2 border border-slate-800">
                      <div class="flex items-center justify-between mb-1">
                        <span class="font-bold text-slate-400 text-[10px] uppercase">Guideline Standard</span>
                        <span class="font-mono text-emerald-400 font-black text-xs">&gt; 90.0%</span>
                      </div>
                      <p class="text-[10px] text-slate-400 leading-tight normal-case">
                        Aligned with <span class="text-white font-bold">WHO Visual Palatability Index</span> to ensure water sources remain clear of macroscopic physical contaminants.
                      </p>
                    </div>
                  </div>
                </div>
                <span class="px-2 py-0.5 rounded border font-extrabold text-[10px]"
                      [ngClass]="sizeStatus().border + ' ' + sizeStatus().bg + ' ' + sizeStatus().textCol">
                  {{ sizeStatus().text }}
                </span>
              </div>
              <div class="text-3xl sm:text-4xl font-black font-mono text-slate-900 my-1">
                94.2 <span class="text-xs font-semibold text-slate-500 font-sans">%</span>
              </div>
              <div class="w-full bg-slate-100 h-2 rounded-full border border-slate-200 overflow-hidden">
                <div [class]="sizeColor() + ' h-full rounded-full transition-all duration-700'" [style.width.%]="sizePct()"></div>
              </div>
              <div class="text-[10px] font-mono font-bold text-slate-600 flex justify-between">
                <span>Avg Size: {{ (data.avg_particle_size_mm || 0.28) | number:'1.2-2' }} mm</span>
                <span>Index: 94.2%</span>
              </div>
            </div>

          </div>

          <!-- Bio-Optical Satellite & Oceanographic Stream -->
          <div class="mt-8 space-y-4 animate-stagger-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-slate-900 pb-3">
              <div>
                <h3 class="text-base font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
                  <span>Bio-Optical Satellite & Oceanographic Stream</span>
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-black bg-teal-50 text-teal-800 border-2 border-slate-900 shadow-[1px_1px_0px_0px_#0f172a]">
                    Top SHAP Drivers
                  </span>
                </h3>
                <p class="text-xs text-slate-700 font-bold">
                  Critical satellite and hydrodynamic parameters driving algal bloom prediction
                </p>
              </div>
              <span class="text-xs font-mono font-black text-slate-900">ISRO EOS-06 / Oceansat-2 Calibrated</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              @for (item of computedShapCards(); track item.rank) {
                  <div class="stamp-card p-5 bg-white space-y-2 hover:bg-slate-50 transition-all flex flex-col justify-between group relative">
                    
                    <!-- Top Row: Rank & Status Pill -->
                    <div>
                      <div class="flex items-center justify-between gap-1.5 mb-2">
                        <span class="px-2.5 py-0.5 rounded-md text-[10px] font-black font-mono bg-slate-100 text-slate-900 border border-slate-300">
                          #{{ item.rank }} • {{ item.shapImportance }}%
                        </span>
                        <span [class]="item.status.badgeClass" class="px-2 py-0.5 border rounded-md text-[10px] font-black uppercase">
                          {{ item.status.label }}
                        </span>
                      </div>

                      <!-- Title & Tooltip Trigger -->
                      <div class="flex items-start justify-between gap-1">
                        <div>
                          <h4 class="text-xs font-black text-slate-900 line-clamp-1 group-hover:text-teal-700 transition-colors uppercase">
                            {{ item.name }}
                          </h4>
                          <div class="text-[10px] text-slate-600 font-bold line-clamp-1">
                            {{ item.shapLabel }}
                          </div>
                        </div>

                        <!-- Tooltip Icon -->
                        <div class="relative group/tooltip shrink-0">
                          <button type="button" class="text-slate-600 hover:text-slate-900 p-0.5" aria-label="Info">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                              <circle cx="12" cy="12" r="10"></circle>
                              <path d="M12 16v-4"></path>
                              <path d="M12 8h.01"></path>
                            </svg>
                          </button>

                          <!-- Rich Glassmorphic Tooltip Card -->
                          <div class="pointer-events-none absolute bottom-full right-0 mb-2 hidden w-72 rounded-xl bg-slate-950 p-4 text-[11px] text-slate-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border-2 border-slate-700 group-hover/tooltip:block z-[1200]">
                            <div class="font-black text-teal-400 mb-2 flex items-center justify-between uppercase border-b border-slate-800 pb-2">
                              <span class="tracking-widest">{{ item.name }}</span>
                            </div>
                            <div class="text-slate-300 mb-3 leading-relaxed font-medium">
                              {{ item.mechanism }}
                            </div>
                            
                            <!-- The new SHAP Info Section -->
                            <div class="bg-slate-900 rounded-lg p-2.5 mb-2 border border-slate-800">
                              <div class="flex items-center justify-between mb-1">
                                <span class="font-bold text-slate-400 text-[10px] uppercase">SHAP Importance</span>
                                <span class="font-mono text-teal-400 font-black text-xs">{{ item.shapImportance }}%</span>
                              </div>
                              <p class="text-[10px] text-slate-400 leading-tight">
                                Ranked <span class="text-white font-bold">#{{ item.rank }}</span> out of 27 ML_Model_N features because it contributes {{ item.shapImportance }}% to the overall predictive variance.
                              </p>
                            </div>
                            
                            <div class="text-[10px] text-slate-500">
                              <span class="text-slate-400 font-bold">Source:</span> {{ item.source }}
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Value Display -->
                      <div class="text-3xl font-black font-mono text-slate-900 my-2">
                        {{ item.valObj.display }}
                      </div>
                      <div class="text-xs text-slate-600 font-bold">
                        Standard: {{ item.standardRange }}
                      </div>
                    </div>

                    <!-- Bottom Dynamic Safety Meter Line -->
                    <div class="w-full bg-slate-100 h-2 rounded-full border border-slate-300 overflow-hidden mt-3">
                      <div [class]="item.status.barClass" class="h-full rounded-full transition-all duration-700 ease-out" [style.width.%]="item.status.pct"></div>
                    </div>

                  </div>
              }
            </div>

            <!-- View All Features Toggle -->
            <div class="flex justify-center mt-6">
              <button (click)="showAllShap.set(!showAllShap())" class="stamp-btn px-5 py-2.5 rounded-xl text-xs font-black bg-slate-50 text-slate-800 border-2 border-slate-900 transition-all hover:bg-slate-100 flex items-center gap-2 shadow-[2px_2px_0px_0px_#0f172a] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#0f172a]">
                <span>{{ showAllShap() ? 'Hide Additional Features' : 'View Other Features' }}</span>
                <svg class="h-4 w-4 transition-transform duration-300" [class.rotate-180]="showAllShap()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Historical Data Chart Embedded -->
          <div class="mt-6 h-[400px]">
            <app-telemetry-charts [historyData]="historyData()" [metric]="selectedMetric()"></app-telemetry-charts>
          </div>
        </div>
      }
    </div>
  `
})
export class LiveMonitoringViewComponent implements OnInit {
  telemetryService = inject(TelemetryService);
  toastService = inject(ToastService);

  telemetry = this.telemetryService.telemetrySignal;
  
  selectedMetric = signal('safety_score');
  historyData = signal<TelemetryData[]>([]);
  
  shapRegistry = TOP_10_SHAP_REGISTRY;

  // Pre-calculate time values for template
  dayOfYear = signal(this.getDayOfYear());
  currentEpoch = signal(this.getCurrentEpoch());

  // Computed signals for main sensor cards
  phPct = computed(() => this.getPercentage(this.telemetry().ph, 0, 14));
  phColor = computed(() => this.getPhColor(this.telemetry().ph));
  phStatus = computed(() => this.getStatusFromColor(this.phColor()));

  turbidityPct = computed(() => this.getPercentage(this.telemetry().turbidity_ntu ?? this.telemetry().turbidity, 0, 50));
  turbidityColor = computed(() => this.getTurbidityColor(this.telemetry().turbidity_ntu ?? this.telemetry().turbidity));
  turbidityStatus = computed(() => this.getStatusFromColor(this.turbidityColor()));

  ecPct = computed(() => this.getPercentage(this.telemetry().ec_us_cm ?? this.telemetry().ec, 0, 1500));
  ecColor = computed(() => this.getEcColor(this.telemetry().ec_us_cm ?? this.telemetry().ec));
  ecStatus = computed(() => this.getStatusFromColor(this.ecColor()));

  tempPct = computed(() => this.getPercentage(this.telemetry().temp_c ?? this.telemetry().temperature, 10, 40));
  tempColor = computed(() => this.getTempColor(this.telemetry().temp_c ?? this.telemetry().temperature));
  tempStatus = computed(() => this.getStatusFromColor(this.tempColor()));

  opticalPct = computed(() => this.getPercentage(this.telemetry().optical_count, 0, 100));
  opticalColor = computed(() => this.getOpticalColor(this.telemetry().optical_count));
  opticalStatus = computed(() => this.getStatusFromColor(this.opticalColor()));

  sizePct = computed(() => this.getPercentage(this.telemetry().avg_particle_size_mm, 0, 1.0));
  sizeColor = computed(() => this.getSizeColor(this.telemetry().avg_particle_size_mm));
  sizeStatus = computed(() => this.getStatusFromColor(this.sizeColor()));

  // Computed signal for SHAP drivers
  showAllShap = signal(false);

  computedShapCards = computed(() => {
    const data = this.telemetry();
    const showAll = this.showAllShap();
    
    let items = [...this.shapRegistry];
    items.sort((a, b) => a.rank - b.rank);
    if (!showAll) {
      items = items.slice(0, 4);
    }

    return items
      .map(item => {
        const valObj = this.getShapParamValue(item, data);
        const status = this.getShapStatus(item, valObj.numVal);
        return { ...item, valObj, status };
      })
      .sort((a, b) => a.rank - b.rank);
  });


  getDayOfYear(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  getCurrentEpoch(): string {
    const month = new Date().toLocaleString('default', { month: 'short' });
    const year = new Date().getFullYear();
    return `${month} ${year}`;
  }

  constructor(private toast: ToastService) {
    this.telemetryService.telemetry$.pipe(
      takeUntilDestroyed()
    ).subscribe();
  }

  async ngOnInit() {
    try {
      const resp = await this.telemetryService.getHistory();
      this.historyData.set(resp.data);
    } catch (e) {
      console.error(e);
    }
  }

  simulate(type: 'dump' | 'rain' | 'alkaline'): void {
    this.telemetryService.simulateSpike(type);
    this.toast.show(`Simulating ${type} conditions...`, 'info');
  }

  selectMetric(metric: string): void {
    this.selectedMetric.set(metric);
  }

  getPercentage(value: number, min: number, max: number): number {
    if (value == null) return 5;
    const pct = ((value - min) / (max - min)) * 100;
    return Math.min(100, Math.max(5, Math.round(pct)));
  }

  getPhColor(ph: number): string {
    if (ph >= 6.5 && ph <= 8.5) return 'bg-emerald-400';
    if ((ph >= 6.0 && ph < 6.5) || (ph > 8.5 && ph <= 9.0)) return 'bg-amber-400';
    return 'bg-rose-500';
  }

  getTurbidityColor(turbidity: number): string {
    if (turbidity <= 10.0) return 'bg-emerald-400';
    if (turbidity <= 30.0) return 'bg-amber-400';
    return 'bg-rose-500';
  }

  getEcColor(ec: number): string {
    if (ec <= 600.0) return 'bg-emerald-400';
    if (ec <= 1200.0) return 'bg-amber-400';
    return 'bg-rose-500';
  }

  getTempColor(val: number): string {
    if (val >= 18.0 && val <= 28.0) return 'bg-emerald-400';
    if ((val >= 15.0 && val < 18.0) || (val > 28.0 && val <= 32.0)) return 'bg-amber-400';
    return 'bg-rose-500';
  }
  
  getOpticalColor(val: number): string {
    if (val <= 100) return 'bg-emerald-400';
    if (val <= 300) return 'bg-amber-400';
    return 'bg-rose-500';
  }

  getSizeColor(val: number): string {
    if (val <= 0.6) return 'bg-emerald-400';
    if (val <= 1.0) return 'bg-amber-400';
    return 'bg-rose-500';
  }

  getStatusFromColor(colorClass: string) {
    if (colorClass.includes('emerald')) return { text: 'NOMINAL', bg: 'bg-emerald-50', textCol: 'text-emerald-700', border: 'border-emerald-200' };
    if (colorClass.includes('amber')) return { text: 'WARNING', bg: 'bg-amber-50', textCol: 'text-amber-700', border: 'border-amber-200' };
    return { text: 'HAZARD', bg: 'bg-rose-50', textCol: 'text-rose-700', border: 'border-rose-200' };
  }

  getShapParamValue(item: ShapParameterCard, data: TelemetryData): { display: string; numVal: number } {
    switch (item.key) {
      case 'chl': return { display: (data.chl ?? 2.10).toFixed(2), numVal: data.chl ?? 2.10 };
      case 'lat': return { display: `${data.coordinates?.lat ?? 16.2699}° N`, numVal: data.coordinates?.lat ?? 16.2699 };
      case 'lng': return { display: `${data.coordinates?.lng ?? 73.7148}° E`, numVal: data.coordinates?.lng ?? 73.7148 };
      case 'kd490': return { display: (data.kd490 ?? 0.14).toFixed(3), numVal: data.kd490 ?? 0.14 };
      case 'season': return { display: 'Post-Monsoon', numVal: 3 };
      case 'tsm': return { display: (data.tsm ?? 4.80).toFixed(2), numVal: data.tsm ?? 4.80 };
      case 'doy': {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now.getTime() - start.getTime();
        const doy = Math.floor(diff / (1000 * 60 * 60 * 24));
        return { display: `Day ${doy}`, numVal: doy };
      }
      case 'waveHeight': return { display: `${(data.waveHeight ?? 1.20).toFixed(2)} m`, numVal: data.waveHeight ?? 1.20 };
      case 'month': return { display: new Date().toLocaleString('default', { month: 'short' }), numVal: new Date().getMonth() + 1 };
      case 'year': return { display: `${new Date().getFullYear()}`, numVal: new Date().getFullYear() };
      default: return { display: '--', numVal: 0 };
    }
  }

  getShapStatus(item: ShapParameterCard, numVal: number): { label: string; badgeClass: string; barClass: string; pct: number } {
    // Inverted risk for wave height (low wave = hazard)
    if (item.invertRisk) {
      const pct = Math.min(100, Math.max(5, (numVal / item.maxVal) * 100));
      if (numVal < 0.6) return { label: 'STAGNANT (HAZARD)', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200', barClass: 'bg-rose-500', pct };
      if (numVal < 1.0) return { label: 'LOW MIXING', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200', barClass: 'bg-amber-500', pct };
      return { label: 'ACTIVE MIXING', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', barClass: 'bg-teal-500', pct };
    }

    // Threshold evaluation for bio-optical metrics
    const pct = Math.min(100, Math.max(5, ((numVal - item.minVal) / (item.maxVal - item.minVal)) * 100));
    if (item.warningMax && numVal > item.warningMax) {
      return { label: 'HAZARD SPIKE', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200', barClass: 'bg-rose-500', pct };
    }
    if (item.safeMax && numVal > item.safeMax) {
      return { label: 'ELEVATED', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200', barClass: 'bg-amber-500', pct };
    }
    return { label: 'NOMINAL', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', barClass: 'bg-teal-500', pct };
  }
}
