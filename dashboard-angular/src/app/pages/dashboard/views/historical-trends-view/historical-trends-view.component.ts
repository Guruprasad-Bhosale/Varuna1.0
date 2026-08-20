import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TelemetryChartsComponent } from '../../../../components/telemetry-charts/telemetry-charts.component';
import { TelemetryService, TelemetryData } from '../../../../services/telemetry.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-historical-trends-view',
  standalone: true,
  imports: [CommonModule, TelemetryChartsComponent, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            Historical Data Analytics
          </h2>
          <p class="text-xs text-slate-400 mt-1">Multi-axis chronological plotting and data export</p>
        </div>

        <div class="flex items-center flex-wrap gap-4 w-full sm:w-auto">
          <!-- Time Range Filter -->
          <div class="flex items-center flex-wrap space-x-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 text-xs w-full sm:w-auto overflow-x-auto">
            <button class="shrink-0 min-h-[44px] px-3 py-1.5 rounded-lg border border-transparent text-slate-400 hover:text-white transition-all font-medium">1H</button>
            <button class="shrink-0 min-h-[44px] px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-medium">24H</button>
            <button class="shrink-0 min-h-[44px] px-3 py-1.5 rounded-lg border border-transparent text-slate-400 hover:text-white transition-all font-medium">7D</button>
            <button class="shrink-0 min-h-[44px] px-3 py-1.5 rounded-lg border border-transparent text-slate-400 hover:text-white transition-all font-medium">30D</button>
            <button class="shrink-0 min-h-[44px] px-3 py-1.5 rounded-lg border border-transparent text-slate-400 hover:text-white transition-all font-medium">All</button>
          </div>

          <!-- Export Buttons -->
          <div class="flex items-center gap-2">
            <button (click)="exportData('csv')" class="shrink-0 min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all">
              <i-lucide name="download" class="w-4 h-4"></i-lucide> CSV
            </button>
            <button (click)="exportData('json')" class="shrink-0 min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all">
              <i-lucide name="download" class="w-4 h-4"></i-lucide> JSON
            </button>
          </div>
        </div>
      </div>

      <!-- Charts Workstation -->
      <div class="grid grid-cols-1 gap-6 w-full">
        <div class="h-[320px] sm:h-[400px] w-full min-w-0">
          <app-telemetry-charts [historyData]="historyData" class="block h-full w-full"></app-telemetry-charts>
        </div>
      </div>
    </div>
  `
})
export class HistoricalTrendsViewComponent implements OnInit, OnDestroy {
  historyData: TelemetryData[] = [];
  private telemetryService = inject(TelemetryService);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private intervalId: any;

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

  private exportTelemetryData(data: any[], format: 'csv' | 'json', filename = 'varuna_telemetry_export'): void {
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
