import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TelemetryService } from '../../../../services/telemetry.service';
import { TelemetryData } from '../../../../core/models/telemetry.model';

@Component({
  selector: 'app-live-monitoring-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 animate-in fade-in duration-300">
      
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
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
          <div class="space-y-3 w-full lg:w-auto">
            <div class="flex items-center gap-2">
              <span [ngClass]="data.status === 'SAFE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'" class="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider border">
                {{ data.status }}
              </span>
              <span class="text-xs text-slate-500 font-medium">Suitable under current monitored conditions</span>
            </div>

            <h3 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{{ data.locationName }}</h3>

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

          <!-- Radial Safety Score Display -->
          <div class="flex items-center gap-5 bg-slate-50 border border-slate-200/80 p-5 rounded-2xl w-full lg:w-72 justify-between shrink-0">
            <div>
              <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Water Safety Index</div>
              <div class="text-3xl font-black text-slate-900 font-mono tracking-tight">{{ data.compositeScore }}<span class="text-sm font-bold text-slate-400">/100</span></div>
              <div class="text-[11px] font-bold text-teal-700 mt-1">{{ data.confidence }}% confidence</div>
              <div class="text-[9px] text-slate-400 uppercase font-mono">NIRVAAH XGBoost</div>
            </div>
            <div class="relative h-16 w-16 flex items-center justify-center">
              <svg class="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path class="text-slate-200" stroke-width="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path [ngClass]="data.compositeScore >= 75 ? 'text-emerald-500' : 'text-rose-500'" stroke-dasharray="100, 100" [attr.stroke-dashoffset]="100 - data.compositeScore" stroke-width="3.5" stroke-linecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Complete 6-Card Edge Sensor Array -->
        <div>
          <div class="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Edge Sensor Array</div>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            
            <!-- 1. pH Level -->
            <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">pH Level</span>
                <span [ngClass]="data.ph >= 6.5 && data.ph <= 8.5 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'" class="px-2 py-0.5 rounded-full text-[10px] font-extrabold border">
                  {{ data.ph >= 6.5 && data.ph <= 8.5 ? 'NOMINAL' : 'OUTLIER' }}
                </span>
              </div>
              <div class="text-3xl font-black text-slate-900 font-mono tracking-tight my-2">
                {{ data.ph | number:'1.2-2' }} <span class="text-xs font-semibold text-slate-400 font-sans">pH</span>
              </div>
              <div class="text-[11px] text-slate-400 font-medium">Standard: 6.5 – 8.5 pH</div>
              <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                <div class="bg-teal-500 h-full rounded-full" [style.width.%]="(data.ph / 14) * 100"></div>
              </div>
            </div>

            <!-- 2. Turbidity -->
            <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Turbidity (Clarity)</span>
                <span [ngClass]="(data.turbidity_ntu ?? data.turbidity) <= 10 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'" class="px-2 py-0.5 rounded-full text-[10px] font-extrabold border">
                  {{ (data.turbidity_ntu ?? data.turbidity) <= 10 ? 'NOMINAL' : 'ELEVATED' }}
                </span>
              </div>
              <div class="text-3xl font-black text-slate-900 font-mono tracking-tight my-2">
                {{ (data.turbidity_ntu ?? data.turbidity) | number:'1.2-2' }} <span class="text-xs font-semibold text-slate-400 font-sans">NTU</span>
              </div>
              <div class="text-[11px] text-slate-400 font-medium">Standard: &le; 10.0 NTU</div>
              <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                <div class="bg-teal-500 h-full rounded-full" [style.width.%]="((data.turbidity_ntu ?? data.turbidity) / 50) * 100"></div>
              </div>
            </div>

            <!-- 3. Electrical Conductivity (EC) -->
            <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Conductivity (EC)</span>
                <span [ngClass]="(data.ec_us_cm ?? data.ec) <= 600 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'" class="px-2 py-0.5 rounded-full text-[10px] font-extrabold border">
                  {{ (data.ec_us_cm ?? data.ec) <= 600 ? 'NOMINAL' : 'HIGH' }}
                </span>
              </div>
              <div class="text-3xl font-black text-slate-900 font-mono tracking-tight my-2">
                {{ (data.ec_us_cm ?? data.ec) | number:'1.1-1' }} <span class="text-xs font-semibold text-slate-400 font-sans">&micro;S/cm</span>
              </div>
              <div class="text-[11px] text-slate-400 font-medium">Standard: &le; 600 &micro;S/cm</div>
              <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                <div class="bg-teal-500 h-full rounded-full" [style.width.%]="((data.ec_us_cm ?? data.ec) / 1500) * 100"></div>
              </div>
            </div>

            <!-- 4. Water Temperature -->
            <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Water Temperature</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  NOMINAL
                </span>
              </div>
              <div class="text-3xl font-black text-slate-900 font-mono tracking-tight my-2">
                {{ (data.temp_c ?? data.temperature) | number:'1.1-1' }} <span class="text-xs font-semibold text-slate-400 font-sans">&deg;C</span>
              </div>
              <div class="text-[11px] text-slate-400 font-medium">Standard: 18.0 &ndash; 28.0 &deg;C</div>
              <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                <div class="bg-teal-500 h-full rounded-full" [style.width.%]="(((data.temp_c ?? data.temperature) - 10) / 30) * 100"></div>
              </div>
            </div>

            <!-- 5. Optical Particulates -->
            <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Optical Particulates</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  NOMINAL
                </span>
              </div>
              <div class="text-3xl font-black text-slate-900 font-mono tracking-tight my-2">
                {{ data.optical_count ?? data.opticalParticulates }} <span class="text-xs font-semibold text-slate-400 font-sans">count</span>
              </div>
              <div class="text-[11px] text-slate-400 font-medium">Standard: &le; 100 count</div>
              <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                <div class="bg-teal-500 h-full rounded-full" [style.width.%]="((data.optical_count ?? data.opticalParticulates) / 100) * 100"></div>
              </div>
            </div>

            <!-- 6. Avg Particle Size -->
            <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Avg Particle Size</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  NOMINAL
                </span>
              </div>
              <div class="text-3xl font-black text-slate-900 font-mono tracking-tight my-2">
                {{ (data.avg_particle_size_mm ?? data.avgParticleSize) | number:'1.2-2' }} <span class="text-xs font-semibold text-slate-400 font-sans">mm</span>
              </div>
              <div class="text-[11px] text-slate-400 font-medium">Standard: &le; 0.60 mm</div>
              <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                <div class="bg-teal-500 h-full rounded-full" [style.width.%]="(((data.avg_particle_size_mm ?? data.avgParticleSize) / 0.60) * 100)"></div>
              </div>
            </div>

          </div>
        </div>
      }
    </div>
  `
})
export class LiveMonitoringViewComponent {
  private telemetryService = inject(TelemetryService);
  telemetry = this.telemetryService.telemetrySignal;

  simulate(type: 'dump' | 'rain' | 'alkaline'): void {
    this.telemetryService.simulateSpike(type);
  }
}
