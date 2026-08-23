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
          <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
            Historical Data Analytics
          </h2>
          <p class="text-xs text-slate-400 mt-1">Multi-axis chronological plotting and data export</p>
        </div>

        <div class="flex items-center flex-wrap gap-4 w-full sm:w-auto">
          <!-- Time Range Filter -->
          <div class="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a]">
            @for (range of ['1H', '24H', '7D', '30D', 'All']; track range) {
              <button 
                (click)="setTimeRange(range)" 
                [class]="selectedRange === range ? 'bg-slate-900 text-white' : 'bg-transparent text-slate-700'"
                class="px-3 py-1 text-xs font-black rounded-lg transition-all">
                {{ range }}
              </button>
            }
          </div>

          <!-- Export Buttons -->
          <div class="flex items-center gap-4">
            <button (click)="exportData('csv')" class="stamp-btn px-4 py-1.5 bg-white text-slate-900 font-black uppercase text-xs border-2 border-slate-900 rounded-lg hover:bg-slate-100 transition-all flex items-center gap-1.5 shadow-[3px_3px_0px_0px_#0f172a]">
              <svg class="h-3.5 w-3.5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              CSV
            </button>
            <button (click)="exportData('json')" class="stamp-btn px-4 py-1.5 bg-white text-slate-900 font-black uppercase text-xs border-2 border-slate-900 rounded-lg hover:bg-slate-100 transition-all flex items-center gap-1.5 shadow-[3px_3px_0px_0px_#0f172a]">
              <svg class="h-3.5 w-3.5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              JSON
            </button>
          </div>
        </div>
      </div>

      <!-- Charts Workstation -->
      <div class="grid grid-cols-1 gap-6 w-full">
        <div class="stamp-card bg-white p-4 h-[320px] sm:h-[400px] w-full min-w-0" style="background-image: radial-gradient(#cbd5e1 1.2px, transparent 1.2px); background-size: 24px 24px;">
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

  private exportTelemetryData(data: TelemetryData[], format: 'csv' | 'json', filename = 'varuna_telemetry_export'): void {
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
