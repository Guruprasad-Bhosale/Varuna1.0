import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TelemetryChartsComponent } from '../../../../components/telemetry-charts/telemetry-charts.component';
import { TelemetryService, TelemetryData } from '../../../../services/telemetry.service';
import { LucideAngularModule, Download } from 'lucide-angular';

@Component({
  selector: 'app-historical-trends-view',
  standalone: true,
  imports: [CommonModule, TelemetryChartsComponent, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Historical Data Analytics</span>
          </h2>
          <p class="text-xs text-slate-700 mt-1 font-bold">Multi-axis chronological plotting, satellite telemetry & data export</p>
        </div>

        <div class="flex items-center flex-wrap gap-4 w-full sm:w-auto">
          <!-- Time Range Filter -->
          <div class="inline-flex items-center gap-1 p-1 bg-white rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a]">
            @for (range of ['1H', '24H', '7D', '30D', 'All']; track range) {
              <button 
                (click)="setTimeRange(range)" 
                [class]="selectedRange === range ? 'bg-slate-900 text-white' : 'bg-transparent text-slate-900 hover:bg-slate-100'"
                class="px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all">
                {{ range }}
              </button>
            }
          </div>

          <!-- Export Buttons -->
          <div class="flex items-center gap-3">
            <button (click)="exportData('csv')" class="stamp-btn px-4 py-2 bg-white text-slate-900 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1.5 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a]">
              <svg class="h-4 w-4 text-slate-900 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              CSV
            </button>
            <button (click)="exportData('json')" class="stamp-btn px-4 py-2 bg-white text-slate-900 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1.5 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a]">
              <svg class="h-4 w-4 text-slate-900 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              JSON
            </button>
          </div>
        </div>
      </div>

      <!-- Bio-Optical Cards Specimen Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="stamp-card p-4 bg-white space-y-1">
          <div class="text-[10px] font-mono font-black text-slate-500 uppercase">CHLOROPHYLL-A [CHL]</div>
          <div class="text-2xl sm:text-3xl font-black font-mono text-slate-900">2.10 <span class="text-xs font-sans text-slate-500">mg/m³</span></div>
          <div class="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded px-2 py-0.5 inline-block">NOMINAL (&le; 2.50)</div>
        </div>
        <div class="stamp-card p-4 bg-white space-y-1">
          <div class="text-[10px] font-mono font-black text-slate-500 uppercase">LIGHT ATTENUATION [KD490]</div>
          <div class="text-2xl sm:text-3xl font-black font-mono text-slate-900">0.140 <span class="text-xs font-sans text-slate-500">m⁻¹</span></div>
          <div class="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded px-2 py-0.5 inline-block">NOMINAL (&le; 0.150)</div>
        </div>
        <div class="stamp-card p-4 bg-white space-y-1">
          <div class="text-[10px] font-mono font-black text-slate-500 uppercase">SUSPENDED MATTER [TSM]</div>
          <div class="text-2xl sm:text-3xl font-black font-mono text-slate-900">4.80 <span class="text-xs font-sans text-slate-500">g/m³</span></div>
          <div class="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded px-2 py-0.5 inline-block">NOMINAL (&le; 5.00)</div>
        </div>
        <div class="stamp-card p-4 bg-white space-y-1">
          <div class="text-[10px] font-mono font-black text-slate-500 uppercase">WAVE HEIGHT [HS]</div>
          <div class="text-2xl sm:text-3xl font-black font-mono text-slate-900">1.20 <span class="text-xs font-sans text-slate-500">m</span></div>
          <div class="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded px-2 py-0.5 inline-block">ACTIVE MIXING (&ge; 1.0)</div>
        </div>
      </div>

      <!-- Charts Workstation -->
      <div class="grid grid-cols-1 gap-6 w-full">
        <div class="h-[400px] sm:h-[450px] w-full min-w-0">
          <app-telemetry-charts [historyData]="historyData" class="block h-full w-full"></app-telemetry-charts>
        </div>
      </div>
    </div>
  `
})
export class HistoricalTrendsViewComponent implements OnInit, OnDestroy {
  readonly DownloadIcon = Download;
  historyData: TelemetryData[] = [];
  private telemetryService = inject(TelemetryService);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private intervalId: ReturnType<typeof setInterval> | undefined;
  selectedRange = '24H';

  setTimeRange(range: string) {
    this.selectedRange = range;
  }

  ngOnInit() {
    this.fetchData();
    // Refresh history periodically, but maybe less frequently than live data
    this.ngZone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => this.fetchData(), 10000);
    });
  }

  async fetchData() {
    try {
      const resp = await this.telemetryService.getHistory();
      this.historyData = resp.data;
      this.cdr.markForCheck();
    } catch (e) {
      console.error(e);
    }
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  exportData(format: 'csv' | 'json') {
    this.exportTelemetryData(this.historyData, format);
  }

  private exportTelemetryData(data: TelemetryData[], format: 'csv' | 'json', filename = 'sagardrishti_telemetry_export'): void {
    if (!data || data.length === 0) return;

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      this.downloadBlob(blob, `${filename}.json`);
    } else {
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row => Object.values(row).map(val => `"${val}"`).join(','));
      const csvContent = [headers, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      this.downloadBlob(blob, `${filename}.csv`);
    }
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }
}
