import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { TelemetryService } from '../../services/telemetry.service';

import { RiverNodesViewComponent } from './views/river-nodes-view/river-nodes-view.component';
import { LiveMonitoringViewComponent } from './views/live-monitoring-view/live-monitoring-view.component';
import { HistoricalTrendsViewComponent } from './views/historical-trends-view/historical-trends-view.component';
import { AlertsViewComponent } from './views/alerts-view/alerts-view.component';
import { CameraScreeningViewComponent } from './views/camera-screening-view/camera-screening-view.component';
import { SettingsViewComponent } from './views/settings-view/settings-view.component';

export type DashboardTab = 'overview' | 'nodes' | 'live' | 'trends' | 'alerts' | 'camera' | 'settings';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, SidebarComponent, NavbarComponent,
    RiverNodesViewComponent, LiveMonitoringViewComponent,
    HistoricalTrendsViewComponent, AlertsViewComponent,
    CameraScreeningViewComponent, SettingsViewComponent
  ],
  template: `
    <div class="flex min-h-screen bg-slate-50 text-slate-800">
      <app-sidebar 
        [activeTab]="activeTab()" 
        (activeTabChange)="setTab($event)"
        [(isSidebarOpen)]="isSidebarOpen">
      </app-sidebar>

      <div class="flex-1 flex flex-col min-w-0">
        <app-navbar 
          [lastSyncTime]="lastSyncTime" 
          (openSidebar)="isSidebarOpen = true">
        </app-navbar>

        <main class="flex-1 p-6 overflow-y-auto">
          <div class="max-w-[1600px] mx-auto">
            @switch (activeTab()) {
              @case ('overview') {
                <app-live-monitoring-view></app-live-monitoring-view>
              }
              @case ('nodes') {
                <app-river-nodes-view></app-river-nodes-view>
              }
              @case ('live') {
                <app-live-monitoring-view></app-live-monitoring-view>
              }
              @case ('trends') {
                <app-historical-trends-view></app-historical-trends-view>
              }
              @case ('alerts') {
                <app-alerts-view></app-alerts-view>
              }
              @case ('camera') {
                <app-camera-screening-view></app-camera-screening-view>
              }
              @case ('settings') {
                <app-settings-view></app-settings-view>
              }
            }
          </div>
        </main>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private telemetryService = inject(TelemetryService);

  activeTab = signal<DashboardTab>('overview');
  isSidebarOpen: boolean = false;
  lastSyncTime: string | null = null;

  ngOnInit(): void {
    // Read ?tab= from URL on load
    this.route.queryParamMap.subscribe(params => {
      const tabParam = params.get('tab') as DashboardTab;
      if (tabParam && ['overview', 'nodes', 'live', 'trends', 'alerts', 'camera', 'settings'].includes(tabParam)) {
        this.activeTab.set(tabParam);
      }
    });

    // We can still maintain a global lastSyncTime if needed by polling a lightweight ping,
    // or rely on the sub-views to fetch their own data.
    setInterval(() => {
       this.lastSyncTime = new Date().toISOString();
    }, 3000);
  }

  setTab(tab: string): void {
    const validTab = tab as DashboardTab;
    this.activeTab.set(validTab);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: validTab },
      queryParamsHandling: 'merge'
    });
  }
}
