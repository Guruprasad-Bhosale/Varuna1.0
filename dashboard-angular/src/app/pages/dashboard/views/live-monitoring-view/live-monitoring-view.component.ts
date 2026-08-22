import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TelemetryService, TelemetryData } from '../../../../services/telemetry.service';
import { ToastService } from '../../../../services/toast.service';
import { TelemetryChartsComponent } from '../../../../components/telemetry-charts/telemetry-charts.component';
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
  imports: [CommonModule, TelemetryChartsComponent],
  template: `
    <div class="space-y-6 animate-stagger-1">
      
      <!-- Top Action Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Live Telemetry Stream</h2>
          <p class="text-xs text-slate-500 font-medium mt-0.5">Real-time edge IoT sensor array telemetry and multi-factor safety index</p>
        </div>

        <div class="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm shrink-0">
          <span class="text-xs font-bold text-slate-500 px-2.5">Simulate:</span>
          <button (click)="simulate('dump')" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-all">Industrial Dump</button>
          <button (click)="simulate('rain')" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-all">Heavy Rain</button>
          <button (click)="simulate('alkaline')" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all">Alkaline Spill</button>
        </div>
      </div>

      <!-- Station Hero Summary Card -->
      @if (telemetry(); as data) {
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6 animate-stagger-2">
          <div class="space-y-3 w-full lg:w-auto">
            <div class="flex items-center gap-2">
              <span [ngClass]="data.status === 'SAFE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'" class="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider border transition-all duration-300 transform" [class.scale-110]="data.status !== 'SAFE'">
                {{ data.status }}
              </span>
              <span class="text-xs text-slate-500 font-medium">Suitable under current monitored conditions</span>
            </div>

            <h3 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <div class="relative w-3 h-3">
                 <div class="absolute inset-0 bg-emerald-500 rounded-full"></div>
                 <div class="absolute inset-0 bg-emerald-500 rounded-full animate-live-ripple"></div>
              </div>
              {{ data.locationName }}
            </h3>

            <div class="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
              <span class="flex items-center gap-1.5">
                <svg class="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                16.2699° N, 73.7148° E
              </span>
              <span class="flex items-center gap-1.5">
                <svg class="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.393 9.393c5.857-5.857 15.355-5.857 21.213 0"/></svg>
                Connected (LTE)
              </span>
              <span class="flex items-center gap-1.5">
                <svg class="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {{ data.timestamp }}
              </span>
            </div>
          </div>

          <!-- Animated Radial Gauge -->
          <div class="flex items-center gap-5 bg-slate-50 border border-slate-200/80 p-5 rounded-2xl w-full lg:w-80 justify-between shrink-0 shadow-sm transition-all duration-500"
               [ngClass]="data.status === 'HAZARD' ? 'border-rose-300 bg-rose-50/40 animate-hazard-glow' : ''">
            <div>
              <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Water Safety Index</div>
              <div class="text-3xl font-black text-slate-900 font-mono tracking-tight flex items-baseline gap-1">
                <span class="transition-all duration-700">{{ data.compositeScore | number:'1.1-1' }}</span>
                <span class="text-sm font-bold text-slate-400">/100</span>
              </div>
              <div class="text-[11px] font-bold mt-1 transition-colors" [ngClass]="data.compositeScore >= 75 ? 'text-teal-700' : 'text-rose-600'">
                {{ data.confidence }}% confidence
              </div>
              <div class="text-[9px] text-slate-400 uppercase font-mono tracking-wider">NIRVAAH XGBoost</div>
            </div>

            <div class="relative h-20 w-20 flex items-center justify-center shrink-0">
              <svg class="h-full w-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" stroke-width="5" stroke="#e2e8f0" fill="none" />
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
                <!-- Safe Shield Icon -->
                <svg *ngIf="data.compositeScore >= 75" class="w-7 h-7 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <!-- Hazard/Warning Icon -->
                <svg *ngIf="data.compositeScore < 75" class="w-7 h-7 text-rose-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>


        <!-- Complete 6-Card Edge Sensor Array -->
        <div class="animate-stagger-3">
          <div class="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex justify-between items-center">
            <span>Edge Sensor Array</span>
            <span class="text-[10px] font-medium text-slate-400 normal-case">Click a card to view 24h history</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            
            <!-- 1. pH Level -->
            <div (click)="selectMetric('ph')" class="bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md cursor-pointer transition-all relative group hover:z-50"
                 [ngClass]="[
                   selectedMetric === 'ph' ? 'ring-2 ring-teal-600 border-teal-500 bg-teal-50/10' : 'border-slate-200 hover:border-slate-300',
                   data.ph < 6.5 || data.ph > 8.5 ? 'animate-hazard-glow' : ''
                 ]">
              <div *ngIf="selectedMetric === 'ph'" class="absolute top-0 right-0 w-8 h-8 bg-teal-500 rounded-bl-2xl rounded-tr-2xl flex items-center justify-center">
                <div class="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div class="flex items-center justify-between pr-4 relative">
                <div class="flex items-center gap-1.5 group/tooltip relative z-20">
                  <span class="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-700 transition-colors">pH Level</span>
                  <svg class="h-3.5 w-3.5 text-slate-400 hover:text-teal-600 cursor-help transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <div class="absolute bottom-full left-0 mb-2 w-56 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity bg-slate-800 text-white text-[10px] rounded-lg p-2.5 shadow-xl font-medium leading-relaxed">
                    <span class="text-teal-300 font-bold block mb-1">Source: WHO Guidelines</span>
                    Measures acidity or alkalinity. Extreme pH levels harm aquatic life and indicate chemical pollution.
                    <div class="absolute -bottom-1 left-4 w-2 h-2 bg-slate-800 rotate-45"></div>
                  </div>
                </div>
                <span [ngClass]="[getStatusFromColor(getPhColor(data.ph)).bg, getStatusFromColor(getPhColor(data.ph)).textCol, getStatusFromColor(getPhColor(data.ph)).border]" class="px-2 py-0.5 rounded-full text-[10px] font-extrabold border transition-all transform" [class.scale-110]="data.ph < 6.5 || data.ph > 8.5">
                  {{ getStatusFromColor(getPhColor(data.ph)).text }}
                </span>
              </div>
              <div class="text-3xl font-black text-slate-900 font-mono tracking-tight my-2 flex gap-1">
                <span class="transition-all duration-700">{{ data.ph | number:'1.2-2' }}</span> <span class="text-xs font-semibold text-slate-400 font-sans mt-auto mb-1">pH</span>
              </div>
              <div class="text-[11px] text-slate-400 font-medium">Standard: 6.5 – 8.5 pH</div>
              <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                <div class="h-full rounded-full transition-all duration-700 ease-out" [ngClass]="getPhColor(data.ph)" [style.width.%]="getPercentage(data.ph, 0, 14)"></div>
              </div>
            </div>

            <!-- 2. Turbidity -->
            <div (click)="selectMetric('turbidity_ntu')" class="bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md cursor-pointer transition-all relative group hover:z-50"
                 [ngClass]="[
                   selectedMetric === 'turbidity_ntu' ? 'ring-2 ring-teal-600 border-teal-500 bg-teal-50/10' : 'border-slate-200 hover:border-slate-300',
                   (data.turbidity_ntu ?? data.turbidity) > 10 ? 'animate-hazard-glow' : ''
                 ]">
              <div *ngIf="selectedMetric === 'turbidity_ntu'" class="absolute top-0 right-0 w-8 h-8 bg-teal-500 rounded-bl-2xl rounded-tr-2xl flex items-center justify-center">
                <div class="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div class="flex items-center justify-between pr-4 relative">
                <div class="flex items-center gap-1.5 group/tooltip relative z-20">
                  <span class="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-700 transition-colors">Turbidity (Clarity)</span>
                  <svg class="h-3.5 w-3.5 text-slate-400 hover:text-teal-600 cursor-help transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <div class="absolute bottom-full left-0 mb-2 w-56 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity bg-slate-800 text-white text-[10px] rounded-lg p-2.5 shadow-xl font-medium leading-relaxed">
                    <span class="text-teal-300 font-bold block mb-1">Source: EPA Standards</span>
                    Measures water clarity based on suspended solids. High turbidity blocks sunlight and harms aquatic ecosystems.
                    <div class="absolute -bottom-1 left-4 w-2 h-2 bg-slate-800 rotate-45"></div>
                  </div>
                </div>
                <span [ngClass]="[getStatusFromColor(getTurbidityColor(data.turbidity_ntu ?? data.turbidity)).bg, getStatusFromColor(getTurbidityColor(data.turbidity_ntu ?? data.turbidity)).textCol, getStatusFromColor(getTurbidityColor(data.turbidity_ntu ?? data.turbidity)).border]" class="px-2 py-0.5 rounded-full text-[10px] font-extrabold border transition-all transform" [class.scale-110]="(data.turbidity_ntu ?? data.turbidity) > 10">
                  {{ getStatusFromColor(getTurbidityColor(data.turbidity_ntu ?? data.turbidity)).text }}
                </span>
              </div>
              <div class="text-3xl font-black text-slate-900 font-mono tracking-tight my-2 flex gap-1">
                <span class="transition-all duration-700">{{ (data.turbidity_ntu ?? data.turbidity) | number:'1.2-2' }}</span> <span class="text-xs font-semibold text-slate-400 font-sans mt-auto mb-1">NTU</span>
              </div>
              <div class="text-[11px] text-slate-400 font-medium">Standard: &le; 10.0 NTU</div>
              <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                <div class="h-full rounded-full transition-all duration-700 ease-out" [ngClass]="getTurbidityColor(data.turbidity_ntu ?? data.turbidity)" [style.width.%]="getPercentage(data.turbidity_ntu ?? data.turbidity, 0, 50)"></div>
              </div>
            </div>

            <!-- 3. Electrical Conductivity (EC) -->
            <div (click)="selectMetric('ec_us_cm')" class="bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md cursor-pointer transition-all relative group hover:z-50"
                 [ngClass]="[
                   selectedMetric === 'ec_us_cm' ? 'ring-2 ring-teal-600 border-teal-500 bg-teal-50/10' : 'border-slate-200 hover:border-slate-300',
                   (data.ec_us_cm ?? data.ec) > 600 ? 'animate-hazard-glow' : ''
                 ]">
              <div *ngIf="selectedMetric === 'ec_us_cm'" class="absolute top-0 right-0 w-8 h-8 bg-teal-500 rounded-bl-2xl rounded-tr-2xl flex items-center justify-center">
                <div class="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div class="flex items-center justify-between pr-4 relative">
                <div class="flex items-center gap-1.5 group/tooltip relative z-20">
                  <span class="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-700 transition-colors">Conductivity (EC)</span>
                  <svg class="h-3.5 w-3.5 text-slate-400 hover:text-teal-600 cursor-help transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <div class="absolute bottom-full left-0 mb-2 w-56 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity bg-slate-800 text-white text-[10px] rounded-lg p-2.5 shadow-xl font-medium leading-relaxed">
                    <span class="text-teal-300 font-bold block mb-1">Source: WHO & EPA</span>
                    Measures the water's ability to conduct electricity, indicating dissolved salts or inorganic chemicals (salinity).
                    <div class="absolute -bottom-1 left-4 w-2 h-2 bg-slate-800 rotate-45"></div>
                  </div>
                </div>
                <span [ngClass]="[getStatusFromColor(getEcColor(data.ec_us_cm ?? data.ec)).bg, getStatusFromColor(getEcColor(data.ec_us_cm ?? data.ec)).textCol, getStatusFromColor(getEcColor(data.ec_us_cm ?? data.ec)).border]" class="px-2 py-0.5 rounded-full text-[10px] font-extrabold border transition-all transform" [class.scale-110]="(data.ec_us_cm ?? data.ec) > 600">
                  {{ getStatusFromColor(getEcColor(data.ec_us_cm ?? data.ec)).text }}
                </span>
              </div>
              <div class="text-3xl font-black text-slate-900 font-mono tracking-tight my-2 flex gap-1">
                <span class="transition-all duration-700">{{ (data.ec_us_cm ?? data.ec) | number:'1.1-1' }}</span> <span class="text-xs font-semibold text-slate-400 font-sans mt-auto mb-1">&micro;S/cm</span>
              </div>
              <div class="text-[11px] text-slate-400 font-medium">Standard: &le; 600 &micro;S/cm</div>
              <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                <div class="h-full rounded-full transition-all duration-700 ease-out" [ngClass]="getEcColor(data.ec_us_cm ?? data.ec)" [style.width.%]="getPercentage(data.ec_us_cm ?? data.ec, 0, 1500)"></div>
              </div>
            </div>

            <!-- 4. Water Temperature -->
            <div (click)="selectMetric('temperature')" class="bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md cursor-pointer transition-all relative group hover:z-50"
                 [ngClass]="selectedMetric === 'temperature' ? 'ring-2 ring-teal-600 border-teal-500 bg-teal-50/10' : 'border-slate-200 hover:border-slate-300'">
              <div *ngIf="selectedMetric === 'temperature'" class="absolute top-0 right-0 w-8 h-8 bg-teal-500 rounded-bl-2xl rounded-tr-2xl flex items-center justify-center">
                <div class="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div class="flex items-center justify-between pr-4 relative">
                <div class="flex items-center gap-1.5 group/tooltip relative z-20">
                  <span class="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-700 transition-colors">Water Temperature</span>
                  <svg class="h-3.5 w-3.5 text-slate-400 hover:text-teal-600 cursor-help transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <div class="absolute bottom-full left-0 mb-2 w-56 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity bg-slate-800 text-white text-[10px] rounded-lg p-2.5 shadow-xl font-medium leading-relaxed">
                    <span class="text-teal-300 font-bold block mb-1">Source: Local Envt. Baseline</span>
                    Sudden temperature spikes can reduce dissolved oxygen and trigger algal blooms or thermal shock to marine life.
                    <div class="absolute -bottom-1 left-4 w-2 h-2 bg-slate-800 rotate-45"></div>
                  </div>
                </div>
                <span [ngClass]="[getStatusFromColor(getTempColor(data.temp_c ?? data.temperature)).bg, getStatusFromColor(getTempColor(data.temp_c ?? data.temperature)).textCol, getStatusFromColor(getTempColor(data.temp_c ?? data.temperature)).border]" class="px-2 py-0.5 rounded-full text-[10px] font-extrabold border transition-all">
                  {{ getStatusFromColor(getTempColor(data.temp_c ?? data.temperature)).text }}
                </span>
              </div>
              <div class="text-3xl font-black text-slate-900 font-mono tracking-tight my-2 flex gap-1">
                <span class="transition-all duration-700">{{ (data.temp_c ?? data.temperature) | number:'1.1-1' }}</span> <span class="text-xs font-semibold text-slate-400 font-sans mt-auto mb-1">&deg;C</span>
              </div>
              <div class="text-[11px] text-slate-400 font-medium">Standard: 18.0 &ndash; 28.0 &deg;C</div>
              <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                <div class="h-full rounded-full transition-all duration-700 ease-out" [ngClass]="getTempColor(data.temp_c ?? data.temperature)" [style.width.%]="getPercentage(data.temp_c ?? data.temperature, 10, 40)"></div>
              </div>
            </div>

            <!-- 5. Optical Particulates -->
            <div (click)="selectMetric('optical_count')" class="bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md cursor-pointer transition-all relative group hover:z-50"
                 [ngClass]="selectedMetric === 'optical_count' ? 'ring-2 ring-teal-600 border-teal-500 bg-teal-50/10' : 'border-slate-200 hover:border-slate-300'">
              <div *ngIf="selectedMetric === 'optical_count'" class="absolute top-0 right-0 w-8 h-8 bg-teal-500 rounded-bl-2xl rounded-tr-2xl flex items-center justify-center">
                <div class="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div class="flex items-center justify-between pr-4 relative">
                <div class="flex items-center gap-1.5 group/tooltip relative z-20">
                  <span class="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-700 transition-colors">Optical Particulates</span>
                  <svg class="h-3.5 w-3.5 text-slate-400 hover:text-teal-600 cursor-help transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <div class="absolute bottom-full left-0 mb-2 w-56 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity bg-slate-800 text-white text-[10px] rounded-lg p-2.5 shadow-xl font-medium leading-relaxed">
                    <span class="text-teal-300 font-bold block mb-1">Source: Hardware Optics</span>
                    Counts raw microscopic particulate matter in the water stream to detect sudden sediment or sewage flushes.
                    <div class="absolute -bottom-1 left-4 w-2 h-2 bg-slate-800 rotate-45"></div>
                  </div>
                </div>
                <span [ngClass]="[getStatusFromColor(getOpticalColor(data.optical_count ?? data.opticalParticulates)).bg, getStatusFromColor(getOpticalColor(data.optical_count ?? data.opticalParticulates)).textCol, getStatusFromColor(getOpticalColor(data.optical_count ?? data.opticalParticulates)).border]" class="px-2 py-0.5 rounded-full text-[10px] font-extrabold border transition-all">
                  {{ getStatusFromColor(getOpticalColor(data.optical_count ?? data.opticalParticulates)).text }}
                </span>
              </div>
              <div class="text-3xl font-black text-slate-900 font-mono tracking-tight my-2 flex gap-1">
                <span class="transition-all duration-700">{{ data.optical_count ?? data.opticalParticulates }}</span> <span class="text-xs font-semibold text-slate-400 font-sans mt-auto mb-1">count</span>
              </div>
              <div class="text-[11px] text-slate-400 font-medium">Standard: &le; 100 count</div>
              <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                <div class="h-full rounded-full transition-all duration-700 ease-out" [ngClass]="getOpticalColor(data.optical_count ?? data.opticalParticulates)" [style.width.%]="getPercentage(data.optical_count ?? data.opticalParticulates, 0, 100)"></div>
              </div>
            </div>

            <!-- 6. Avg Particle Size -->
            <div (click)="selectMetric('avg_particle_size')" class="bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md cursor-pointer transition-all relative group hover:z-50"
                 [ngClass]="selectedMetric === 'avg_particle_size' ? 'ring-2 ring-teal-600 border-teal-500 bg-teal-50/10' : 'border-slate-200 hover:border-slate-300'">
              <div *ngIf="selectedMetric === 'avg_particle_size'" class="absolute top-0 right-0 w-8 h-8 bg-teal-500 rounded-bl-2xl rounded-tr-2xl flex items-center justify-center">
                <div class="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div class="flex items-center justify-between pr-4 relative">
                <div class="flex items-center gap-1.5 group/tooltip relative z-20">
                  <span class="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-700 transition-colors">Avg Particle Size</span>
                  <svg class="h-3.5 w-3.5 text-slate-400 hover:text-teal-600 cursor-help transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <div class="absolute bottom-full left-0 mb-2 w-56 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity bg-slate-800 text-white text-[10px] rounded-lg p-2.5 shadow-xl font-medium leading-relaxed">
                    <span class="text-teal-300 font-bold block mb-1">Source: Flow Cytometry</span>
                    Calculates the average diameter of suspended particles. Larger particles often indicate untreated industrial discharge.
                    <div class="absolute -bottom-1 left-4 w-2 h-2 bg-slate-800 rotate-45"></div>
                  </div>
                </div>
                <span [ngClass]="[getStatusFromColor(getSizeColor(data.avg_particle_size_mm ?? data.avgParticleSize)).bg, getStatusFromColor(getSizeColor(data.avg_particle_size_mm ?? data.avgParticleSize)).textCol, getStatusFromColor(getSizeColor(data.avg_particle_size_mm ?? data.avgParticleSize)).border]" class="px-2 py-0.5 rounded-full text-[10px] font-extrabold border transition-all">
                  {{ getStatusFromColor(getSizeColor(data.avg_particle_size_mm ?? data.avgParticleSize)).text }}
                </span>
              </div>
              <div class="text-3xl font-black text-slate-900 font-mono tracking-tight my-2 flex gap-1">
                <span class="transition-all duration-700">{{ (data.avg_particle_size_mm ?? data.avgParticleSize) | number:'1.2-2' }}</span> <span class="text-xs font-semibold text-slate-400 font-sans mt-auto mb-1">mm</span>
              </div>
              <div class="text-[11px] text-slate-400 font-medium">Standard: &le; 0.60 mm</div>
              <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                <div class="h-full rounded-full transition-all duration-700 ease-out" [ngClass]="getSizeColor(data.avg_particle_size_mm ?? data.avgParticleSize)" [style.width.%]="getPercentage((data.avg_particle_size_mm ?? data.avgParticleSize), 0, 1.0)"></div>
              </div>
            </div>

          </div>

          <!-- SHAP Model Driver Grid Section -->
          <div class="mt-8 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
              <div>
                <h3 class="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>NIRVAAH AI & Satellite Feature Drivers</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                    Ranked by SHAP Weight
                  </span>
                </h3>
                <p class="text-xs text-slate-500">
                  Top 10 earth observation and contextual features driving the 27-feature XGBoost bloom prediction model
                </p>
              </div>
              <span class="text-[11px] font-mono text-slate-400">ISRO EOS-06 / Oceansat-2 Calibrated</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              @for (item of shapRegistry; track item.rank) {
                @if (telemetry(); as data) {
                  @let valObj = getShapParamValue(item, data);
                  @let status = getShapStatus(item, valObj.numVal);

                  <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between group relative">
                    
                    <!-- Top Row: Rank & Status Pill -->
                    <div>
                      <div class="flex items-center justify-between gap-1.5 mb-2">
                        <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold font-mono bg-slate-100 text-slate-700 border border-slate-200 group-hover:bg-teal-50 group-hover:text-teal-700 transition-colors">
                          #{{ item.rank }} • {{ item.shapImportance }}%
                        </span>
                        <span [class]="status.badgeClass" class="px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase border">
                          {{ status.label }}
                        </span>
                      </div>

                      <!-- Title & Tooltip Trigger -->
                      <div class="flex items-start justify-between gap-1">
                        <div>
                          <h4 class="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-teal-700 transition-colors">
                            {{ item.name }}
                          </h4>
                          <div class="text-[10px] text-slate-400 font-medium line-clamp-1">
                            {{ item.shapLabel }}
                          </div>
                        </div>

                        <!-- Tooltip Icon -->
                        <div class="relative group/tooltip shrink-0">
                          <button type="button" class="text-slate-400 hover:text-teal-600 p-0.5" aria-label="Info">
                            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <path d="M12 16v-4"></path>
                              <path d="M12 8h.01"></path>
                            </svg>
                          </button>

                          <!-- Rich Glassmorphic Tooltip Card -->
                          <div class="pointer-events-none absolute bottom-full right-0 mb-2 hidden w-64 rounded-xl bg-slate-950/95 p-3 text-[11px] text-slate-200 shadow-2xl backdrop-blur-md border border-slate-800 group-hover/tooltip:block z-[1200]">
                            <div class="font-bold text-teal-400 mb-1 flex items-center justify-between">
                              <span>{{ item.name }}</span>
                              <span class="text-[9px] text-slate-400 font-mono">Rank #{{ item.rank }}</span>
                            </div>
                            <div class="text-slate-300 mb-2 leading-relaxed">
                              {{ item.mechanism }}
                            </div>
                            <div class="border-t border-slate-800/80 pt-1.5 text-[10px] text-slate-400">
                              <span class="text-slate-200 font-semibold">Source:</span> {{ item.source }}
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Value Display -->
                      <div class="text-2xl font-black text-slate-900 font-mono tracking-tight my-2">
                        {{ valObj.display }}
                      </div>
                      <div class="text-[10px] text-slate-400 font-medium">
                        Standard: {{ item.standardRange }}
                      </div>
                    </div>

                    <!-- Bottom Dynamic Safety Meter Line -->
                    <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                      <div [class]="status.barClass" class="h-full rounded-full transition-all duration-700 ease-out" [style.width.%]="status.pct"></div>
                    </div>

                  </div>
                }
              }
            </div>
          </div>

          <!-- Historical Data Chart Embedded -->
          <div class="mt-6 h-[400px]">
            <app-telemetry-charts [historyData]="historyData" [metric]="selectedMetric"></app-telemetry-charts>
          </div>
        </div>
      }
    </div>
  `
})
export class LiveMonitoringViewComponent implements OnInit {
  private telemetryService = inject(TelemetryService);
  telemetry = this.telemetryService.telemetrySignal;
  
  selectedMetric = 'safety_score';
  historyData: TelemetryData[] = [];
  
  shapRegistry = TOP_10_SHAP_REGISTRY;

  constructor(private toast: ToastService) {
    this.telemetryService.telemetry$.pipe(
      takeUntilDestroyed()
    ).subscribe();
  }

  async ngOnInit() {
    try {
      const resp = await this.telemetryService.getHistory();
      this.historyData = resp.data;
    } catch (e) {
      console.error(e);
    }
  }

  simulate(type: 'dump' | 'rain' | 'alkaline'): void {
    this.telemetryService.simulateSpike(type);
    this.toast.show(`Simulating ${type} conditions...`, 'info');
  }

  selectMetric(metric: string): void {
    this.selectedMetric = metric;
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
