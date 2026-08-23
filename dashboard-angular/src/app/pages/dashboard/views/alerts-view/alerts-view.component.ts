import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertCenterComponent } from '../../../../components/alert-center/alert-center.component';
import { TelemetryService } from '../../../../services/telemetry.service';

export interface IncidentAlert {
  id: string;
  timestamp: string;
  timeAgo: string;
  station: string;
  river: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  parameters: string;
  status: 'ACTIVE' | 'RESOLVED' | 'DISPATCHED';
}

@Component({
  selector: 'app-alerts-view',
  standalone: true,
  imports: [CommonModule, AlertCenterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
            Incident & Alert Center
          </h2>
          <p class="text-xs text-slate-500 mt-1">Real-time anomaly detection logs and automated dispatch status</p>
        </div>

        <div class="inline-flex items-center gap-2 p-1 bg-slate-100 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a]">
          <button 
            (click)="setFilter('ALL')" 
            [class]="activeFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-transparent text-slate-700'"
            class="px-3 py-1 text-xs font-black rounded-lg transition-all">
            All Incidents
          </button>
          <button 
            (click)="setFilter('CRITICAL')" 
            [class]="activeFilter === 'CRITICAL' ? 'bg-rose-600 text-white' : 'bg-transparent text-rose-700'"
            class="px-3 py-1 text-xs font-black rounded-lg transition-all flex items-center gap-1.5">
            Critical <span class="h-2 w-2 rounded-full bg-rose-400"></span>
          </button>
          <button 
            (click)="setFilter('WARNING')" 
            [class]="activeFilter === 'WARNING' ? 'bg-amber-500 text-white' : 'bg-transparent text-amber-700'"
            class="px-3 py-1 text-xs font-black rounded-lg transition-all flex items-center gap-1.5">
            Warning <span class="h-2 w-2 rounded-full bg-amber-300"></span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6">
        <div class="h-[600px]">
          <app-alert-center [alerts]="filteredAlerts"></app-alert-center>
        </div>
      </div>
    </div>
  `
})
export class AlertsViewComponent implements OnInit {
  allAlerts: IncidentAlert[] = [
    {
      id: 'ALT-2026-088',
      timestamp: 'Today, 06:15 PM',
      timeAgo: '35m ago',
      station: 'VARUNA-001',
      river: 'Gad River Outfall',
      severity: 'CRITICAL',
      title: 'Severe Acidic Industrial Effluent Detected',
      description: 'pH dropped to 5.12 with concurrent conductivity surge (1,140 µS/cm). Automated WhatsApp dispatch sent.',
      parameters: 'pH 5.12 • EC 1140 µS/cm • Score 31.5',
      status: 'DISPATCHED'
    },
    {
      id: 'ALT-2026-087',
      timestamp: 'Today, 02:40 PM',
      timeAgo: '4h ago',
      station: 'VARUNA-002',
      river: 'Karli River Bridge',
      severity: 'WARNING',
      title: 'Turbidity Washout from Upstream Agricultural Inflow',
      description: 'Turbidity reached 19.5 NTU following localized rain runoff. Monitored for sediment settling.',
      parameters: 'Turbidity 19.5 NTU • Score 76.2',
      status: 'RESOLVED'
    },
    {
      id: 'ALT-2026-086',
      timestamp: 'Yesterday, 11:20 AM',
      timeAgo: '1d ago',
      station: 'VARUNA-001',
      river: 'Gad River Outfall',
      severity: 'WARNING',
      title: 'Thermal Stratification Early Bloom Flag',
      description: 'Water temperature anomaly (ΔT +2.1°C) with low wave mixing. 48h NIRVAAH XGBoost bloom alert triggered.',
      parameters: 'Temp 28.4°C • CHL 6.2 mg/m³',
      status: 'RESOLVED'
    }
  ];
  filteredAlerts: IncidentAlert[] = [];
  activeFilter: 'ALL' | 'CRITICAL' | 'WARNING' = 'ALL';
  
  ngOnInit() {
    this.applyFilter();
  }

  setFilter(filter: 'ALL' | 'CRITICAL' | 'WARNING') {
    this.activeFilter = filter;
    this.applyFilter();
  }
  
  applyFilter() {
    if (this.activeFilter === 'ALL') {
      this.filteredAlerts = [...this.allAlerts];
    } else {
      this.filteredAlerts = this.allAlerts.filter(a => a.severity === this.activeFilter);
    }
  }
}
