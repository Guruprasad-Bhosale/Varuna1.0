import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { TelemetryService, TelemetryData } from './services/telemetry.service';
import { ThresholdService } from './services/threshold.service';

import { SafetyHeroCardComponent } from './components/safety-hero-card/safety-hero-card.component';
import { SensorMetricGridComponent } from './components/sensor-metric-grid/sensor-metric-grid.component';
import { ThresholdConfigModalComponent } from './components/threshold-config-modal/threshold-config-modal.component';
import { NodeMapComponent } from './components/node-map/node-map.component';
import { TelemetryChartsComponent } from './components/telemetry-charts/telemetry-charts.component';
import { AlertCenterComponent } from './components/alert-center/alert-center.component';
import { CameraScreeningPanelComponent } from './components/camera-screening-panel/camera-screening-panel.component';
import { ModelInsightsComponent } from './components/model-insights/model-insights.component';
import { DeviceHealthComponent } from './components/device-health/device-health.component';
import { WhatsappModalComponent } from './components/whatsapp-modal/whatsapp-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, SidebarComponent, NavbarComponent, SafetyHeroCardComponent, 
    SensorMetricGridComponent, ThresholdConfigModalComponent, NodeMapComponent, 
    TelemetryChartsComponent, AlertCenterComponent, CameraScreeningPanelComponent,
    ModelInsightsComponent, DeviceHealthComponent, WhatsappModalComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  activeTab: string = 'overview';
  isSidebarOpen: boolean = false;
  
  latestData: TelemetryData | null = null;
  historyData: TelemetryData[] = [];
  alerts: any[] = [];
  lastSyncTime: string | null = null;

  constructor(
    private telemetryService: TelemetryService,
    private thresholdService: ThresholdService
  ) {}

  ngOnInit() {
    this.fetchData();
    setInterval(() => this.fetchData(), 3000);
  }

  onSidebarToggle(isOpen: boolean) {
    this.isSidebarOpen = isOpen;
    setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
  }

  async fetchData() {
    try {
      const latestResp = await this.telemetryService.getLatest();
      this.latestData = latestResp.data;
      this.lastSyncTime = new Date().toISOString();

      const historyResp = await this.telemetryService.getHistory();
      this.historyData = historyResp.data;

      const alertsResp = await this.telemetryService.getAlerts();
      this.alerts = alertsResp.data;
    } catch (error) {
      console.error("Error fetching telemetry:", error);
    }
  }
}
