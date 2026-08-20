import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafetyHeroCardComponent } from '../../../../components/safety-hero-card/safety-hero-card.component';
import { SensorMetricGridComponent } from '../../../../components/sensor-metric-grid/sensor-metric-grid.component';
import { TelemetryService, TelemetryData } from '../../../../services/telemetry.service';

@Component({
  selector: 'app-live-monitoring-view',
  standalone: true,
  imports: [CommonModule, SafetyHeroCardComponent, SensorMetricGridComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
          Live Telemetry Stream
        </h2>
        
        <!-- Anomaly Simulation Dock -->
        <div class="flex items-center gap-2 text-xs bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-slate-500 font-medium px-2 border-r border-slate-200">Simulate Spikes:</span>
          <button (click)="simulateSpike('industrial')" class="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-all font-medium">Industrial Dump</button>
          <button (click)="simulateSpike('rain')" class="px-3 py-1.5 rounded-lg bg-cyan-50 text-cyan-600 hover:bg-cyan-100 border border-cyan-200 transition-all font-medium">Heavy Rain</button>
          <button (click)="simulateSpike('alkaline')" class="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 transition-all font-medium">Alkaline Spill</button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6">
        <app-safety-hero-card [latestData]="latestData"></app-safety-hero-card>
        
        <div class="w-full">
          <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 pl-1">Edge Sensor Array</h3>
          <app-sensor-metric-grid [latestData]="latestData"></app-sensor-metric-grid>
        </div>
      </div>
    </div>
  `
})
export class LiveMonitoringViewComponent implements OnInit, OnDestroy {
  latestData: TelemetryData | null = null;
  private telemetryService = inject(TelemetryService);
  private intervalId: any;

  ngOnInit() {
    this.fetchData();
    this.intervalId = setInterval(() => this.fetchData(), 3000);
  }

  async fetchData() {
    try {
      const resp = await this.telemetryService.getLatest();
      this.latestData = resp.data;
    } catch (e) {
      console.error(e);
    }
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  simulateSpike(type: 'industrial' | 'rain' | 'alkaline') {
    // Placeholder for actual anomaly generation API call
    console.log('Simulating anomaly spike:', type);
    // You could inject a temporary mocked latestData here to show UI change immediately
  }
}
