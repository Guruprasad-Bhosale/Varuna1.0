import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertCenterComponent } from '../../../../components/alert-center/alert-center.component';
import { TelemetryService } from '../../../../services/telemetry.service';

@Component({
  selector: 'app-alerts-view',
  standalone: true,
  imports: [CommonModule, AlertCenterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            Incident & Alert Center
          </h2>
          <p class="text-xs text-slate-400 mt-1">Real-time anomaly detection logs and automated dispatch status</p>
        </div>

        <div class="flex items-center space-x-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button class="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-medium transition-all">
            All Incidents
          </button>
          <button class="px-3 py-1.5 rounded-lg border border-transparent text-rose-400 hover:bg-rose-500/10 transition-all font-medium">
            Critical 🔴
          </button>
          <button class="px-3 py-1.5 rounded-lg border border-transparent text-amber-400 hover:bg-amber-500/10 transition-all font-medium">
            Warning 🟠
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6">
        <div class="h-[600px]">
          <app-alert-center [alerts]="alerts"></app-alert-center>
        </div>
      </div>
    </div>
  `
})
export class AlertsViewComponent implements OnInit, OnDestroy {
  alerts: any[] = [];
  private telemetryService = inject(TelemetryService);
  private intervalId: any;

  ngOnInit() {
    this.fetchData();
    this.intervalId = setInterval(() => this.fetchData(), 5000);
  }

  async fetchData() {
    try {
      const resp = await this.telemetryService.getAlerts();
      this.alerts = resp.data;
    } catch (e) {
      console.error(e);
    }
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
