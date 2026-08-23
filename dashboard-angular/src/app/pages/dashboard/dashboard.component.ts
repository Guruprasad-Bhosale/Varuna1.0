import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { TelemetryService } from '../../services/telemetry.service';
import { ToastService } from '../../services/toast.service';

import { RiverNodesViewComponent } from './views/river-nodes-view/river-nodes-view.component';
import { LiveMonitoringViewComponent } from './views/live-monitoring-view/live-monitoring-view.component';
import { HistoricalTrendsViewComponent } from './views/historical-trends-view/historical-trends-view.component';
import { AlertsViewComponent } from './views/alerts-view/alerts-view.component';
import { CameraScreeningViewComponent } from './views/camera-screening-view/camera-screening-view.component';
import { SettingsViewComponent } from './views/settings-view/settings-view.component';
import { ContactViewComponent } from './views/contact-view/contact-view.component';
import { ThresholdConfigModalComponent } from '../../components/threshold-config-modal/threshold-config-modal.component';

export type DashboardTab = 'overview' | 'nodes' | 'live' | 'trends' | 'alerts' | 'camera' | 'settings' | 'contact';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, SidebarComponent, NavbarComponent,
    RiverNodesViewComponent, LiveMonitoringViewComponent,
    HistoricalTrendsViewComponent, AlertsViewComponent,
    CameraScreeningViewComponent, SettingsViewComponent,
    ThresholdConfigModalComponent, ContactViewComponent
  ],
  template: `
    <div class="flex min-h-screen bg-slate-50 text-slate-800">
      <app-sidebar 
        [isOpen]="isSidebarOpen"
        (close)="isSidebarOpen = false">
      </app-sidebar>

      <div class="flex-1 flex flex-col min-w-0 relative">
        <app-navbar 
          [lastSyncTime]="lastSyncTime" 
          (openSidebar)="isSidebarOpen = true">
        </app-navbar>
        
        <!-- Top-bar progress loader -->
        @if (isNavigating()) {
          <div class="absolute top-16 left-0 right-0 overflow-hidden z-40">
             <div class="h-[2px] bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400 w-[40%] animate-pulse relative" style="animation: slide-right 1.5s ease-in-out infinite alternate; left: 0%;"></div>
          </div>
        }

        <main class="flex-1 p-6 overflow-y-auto">
          <div class="max-w-[1600px] mx-auto animate-in fade-in duration-300 slide-in-from-bottom-2" [class.opacity-50]="isNavigating()">
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
              @case ('contact') {
                <app-contact-view></app-contact-view>
              }
            }
          </div>
        </main>
      </div>

      <app-threshold-config-modal></app-threshold-config-modal>

      <!-- Global Toast Container -->
      <div class="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        @for (toast of toastService.toasts(); track toast.id) {
          <div class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-bottom-5 fade-in duration-300"
               [ngClass]="{
                 'bg-emerald-50 text-emerald-800 border-emerald-200': toast.type === 'success',
                 'bg-rose-50 text-rose-800 border-rose-200': toast.type === 'error',
                 'bg-sky-50 text-sky-800 border-sky-200': toast.type === 'info'
               }">
            <div class="font-semibold text-sm">{{ toast.message }}</div>
          </div>
        }
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  public toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private telemetryService = inject(TelemetryService);

  activeTab = signal<DashboardTab>('overview');
  isNavigating = signal<boolean>(false);
  isSidebarOpen: boolean = false;
  lastSyncTime: string | null = null;

  private syncInterval: any;

  ngOnInit(): void {
    // Read ?tab= from URL on load
    this.route.queryParamMap.subscribe(params => {
      const tabParam = params.get('tab') as DashboardTab;
      if (tabParam && ['overview', 'nodes', 'live', 'trends', 'alerts', 'camera', 'settings', 'contact'].includes(tabParam)) {
        this.activeTab.set(tabParam);
      }
    });

    this.syncInterval = setInterval(() => {
       this.lastSyncTime = new Date().toISOString();
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.syncInterval) clearInterval(this.syncInterval);
  }

  setTab(tab: string): void {
    const validTab = tab as DashboardTab;
    
    // Smooth View Loading Transition
    this.isNavigating.set(true);
    
    setTimeout(() => {
      this.activeTab.set(validTab);
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { tab: validTab },
        queryParamsHandling: 'merge'
      });
      
      setTimeout(() => this.isNavigating.set(false), 150);
    }, 150);
  }
}
