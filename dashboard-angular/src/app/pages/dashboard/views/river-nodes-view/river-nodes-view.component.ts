import { Component, AfterViewInit, OnDestroy, signal, ChangeDetectionStrategy, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Map } from 'lucide-angular';
import * as L from 'leaflet';

export interface BloomForecastNode {
  id: string;
  name: string;
  location: string;
  river: string;
  lat: number;
  lng: number;
  forecastWindow: '48h' | '72h';
  bloomProbability: number; // percentage
  predictedChl: number; // mg/m3
  triggerFactors: string[];
  riskTier: 'Elevated' | 'High-Risk Warning' | 'Critical Outbreak';
  recommendation: string;
}

@Component({
  selector: 'app-river-nodes-view',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <lucide-icon [img]="MapIcon" class="h-6 w-6 text-teal-600"></lucide-icon>
            Sindhudurg Basin Network & Bloom Forecast
          </h2>
          <p class="text-xs text-slate-500 mt-1 font-medium">
            Real-time telemetry and 48–72h AI predictive algal bloom early warning zones
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Bloom Forecast Layer Toggle -->
          <button 
            (click)="toggleBloomForecast()"
            [ngClass]="showBloomForecast() ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
            class="px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm">
            <span class="relative flex h-2 w-2">
              @if (showBloomForecast()) {
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              }
              <span class="relative inline-flex rounded-full h-2 w-2" [ngClass]="showBloomForecast() ? 'bg-emerald-400' : 'bg-slate-500'"></span>
            </span>
            48–72h Bloom Forecast
          </button>

          <!-- Tile Selector -->
          <div class="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm text-xs">
            <button (click)="setTileLayer('voyager')" [ngClass]="activeTileLayer() === 'voyager' ? 'bg-teal-50 text-teal-700 border-teal-200 font-semibold' : 'text-slate-600 hover:bg-slate-50'" class="px-2.5 py-1 rounded-lg border border-transparent transition-all">Voyager</button>
            <button (click)="setTileLayer('satellite')" [ngClass]="activeTileLayer() === 'satellite' ? 'bg-teal-50 text-teal-700 border-teal-200 font-semibold' : 'text-slate-600 hover:bg-slate-50'" class="px-2.5 py-1 rounded-lg border border-transparent transition-all">Satellite</button>
            <button (click)="setTileLayer('dark')" [ngClass]="activeTileLayer() === 'dark' ? 'bg-teal-50 text-teal-700 border-teal-200 font-semibold' : 'text-slate-600 hover:bg-slate-50'" class="px-2.5 py-1 rounded-lg border border-transparent transition-all">Dark</button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div class="lg:col-span-3 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden relative h-[420px] sm:h-[500px] lg:h-[640px]" style="isolation: isolate; position: relative; z-index: 1;">
          <div id="sindhudurg-gis-map" class="h-full w-full" style="touch-action: pan-x pan-y;"></div>
          
          <!-- Map Legend -->
          <div class="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 text-[11px] text-slate-800 space-y-2 shadow-lg max-w-xs">
            <div class="font-semibold text-slate-900 flex items-center justify-between">
              <span>Map Legend</span>
              <span class="text-[10px] text-teal-600 font-mono">NIRVAAH AI</span>
            </div>
            <div class="flex items-center space-x-2"><span class="h-2 w-5 bg-cyan-400 rounded-sm"></span><span>Gad River</span></div>
            <div class="flex items-center space-x-2"><span class="h-2 w-5 bg-teal-400 rounded-sm"></span><span>Karli River</span></div>
            <hr class="border-slate-200 my-1"/>
            <div class="flex items-center space-x-2"><span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span><span>Safe Monitoring Station</span></div>
            <div class="flex items-center space-x-2"><span class="h-2.5 w-2.5 rounded-full bg-rose-500"></span><span>Active Hazard Station</span></div>
            <div class="flex items-center space-x-2">
              <span class="h-3 w-3 rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 border border-white shadow-sm flex items-center justify-center"></span>
              <span class="text-amber-700 font-medium">Predicted Bloom (48–72h)</span>
            </div>
          </div>
        </div>

        <!-- Predictive Bloom Sidebar Feed -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Bloom Early Warnings
            </div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 font-mono">
              {{ bloomForecasts.length }} Forecasts
            </span>
          </div>

          <div class="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            @for (bloom of bloomForecasts; track bloom.id) {
              <div 
                (click)="flyToBloom(bloom)"
                class="p-4 rounded-xl bg-white border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer space-y-3 group">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <div class="font-semibold text-sm text-slate-900 transition-colors flex items-center gap-1.5">
                      {{ bloom.name }}
                    </div>
                    <div class="text-[11px] text-teal-600 font-medium">{{ bloom.river }} • {{ bloom.location }}</div>
                  </div>
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200 font-mono shrink-0">
                    +{{ bloom.forecastWindow }}
                  </span>
                </div>

                <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1.5 text-[11px]">
                  <div class="flex justify-between items-center text-slate-600">
                    <span>Bloom Probability:</span>
                    <span class="font-bold text-amber-600 font-mono">{{ bloom.bloomProbability }}%</span>
                  </div>
                  <div class="flex justify-between items-center text-slate-600">
                    <span>Projected Chlorophyll:</span>
                    <span class="font-bold text-emerald-600 font-mono">{{ bloom.predictedChl }} mg/m³</span>
                  </div>
                </div>

                <div class="text-[11px] text-slate-600 leading-tight">
                  <span class="text-slate-800 font-medium">Triggers:</span> {{ bloom.triggerFactors.join(', ') }}
                </div>

                <div class="flex items-center justify-between text-xs text-amber-700 pt-2 border-t border-slate-100">
                  <span class="text-[10px] text-slate-500 font-semibold">{{ bloom.riskTier }}</span>
                  <span class="flex items-center gap-1 font-semibold">Inspect on Map &rarr;</span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class RiverNodesViewComponent implements AfterViewInit, OnDestroy {
  readonly MapIcon = Map;
  private ngZone = inject(NgZone);

  activeTileLayer = signal<'voyager' | 'satellite' | 'dark'>('voyager');
  showBloomForecast = signal<boolean>(true);

  private map?: L.Map;
  private currentTileLayerGroup = new L.LayerGroup();
  private markersLayerGroup = new L.LayerGroup();
  private bloomForecastLayerGroup = new L.LayerGroup();
  private riverLinesGroup = new L.LayerGroup();

  // 48h to 72h Predictive Algal Bloom Forecast Points
  readonly bloomForecasts: BloomForecastNode[] = [
    {
      id: 'BLOOM-FC-01',
      name: 'Sarjekot Estuary Confluence',
      location: 'Malvan Coastal Outfall',
      river: 'Gad River',
      lat: 16.0820,
      lng: 73.4680,
      forecastWindow: '48h',
      bloomProbability: 86.4,
      predictedChl: 8.45,
      triggerFactors: ['Thermal Stratification (ΔT +2.4°C)', 'High Turbidity Outfall', 'Low Wave Mixing'],
      riskTier: 'High-Risk Warning',
      recommendation: 'Deploy surface micro-aerators & initiate water intake pre-treatment.'
    },
    {
      id: 'BLOOM-FC-02',
      name: 'Devbag Creek Estuary',
      location: 'Tarkarli Bay Zone',
      river: 'Karli River',
      lat: 15.9760,
      lng: 73.4930,
      forecastWindow: '72h',
      bloomProbability: 78.2,
      predictedChl: 6.90,
      triggerFactors: ['Agricultural Runoff Inflow', 'Elevated EC (1,420 µS/cm)', 'Solar Irradiance Spike'],
      riskTier: 'Elevated',
      recommendation: 'Alert coastal aquaculture units and increase automated sampling frequency.'
    }
  ];

  readonly riverNodes = [
    { id: 'NODE-01', name: 'Gad River Headwaters', lat: 16.1750, lng: 73.6100, status: 'SAFE', ph: 7.4, temp: 24.2, ec: 310 },
    { id: 'NODE-02', name: 'Malvan Estuary', lat: 16.1250, lng: 73.5350, status: 'WARNING', ph: 6.8, temp: 26.5, ec: 850 },
    { id: 'NODE-03', name: 'Gad Outfall', lat: 16.0750, lng: 73.4750, status: 'SAFE', ph: 7.8, temp: 25.1, ec: 420 },
    { id: 'NODE-04', name: 'Kudal Upstream', lat: 16.0050, lng: 73.5900, status: 'SAFE', ph: 7.2, temp: 23.9, ec: 280 },
    { id: 'NODE-05', name: 'Karli Bridge', lat: 15.9850, lng: 73.5300, status: 'HAZARD', ph: 5.8, temp: 28.1, ec: 1120 },
    { id: 'NODE-06', name: 'Devbag Confluence', lat: 15.9760, lng: 73.4930, status: 'WARNING', ph: 6.9, temp: 27.0, ec: 940 }
  ];

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.initMap();
    });
  }

  private initMap(): void {
    this.map = L.map('sindhudurg-gis-map', {
      center: [16.1200, 73.6200],
      zoom: 11,
      preferCanvas: true,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    this.currentTileLayerGroup.addTo(this.map);
    this.riverLinesGroup.addTo(this.map);
    this.markersLayerGroup.addTo(this.map);
    this.bloomForecastLayerGroup.addTo(this.map);

    this.setTileLayer('voyager');
    this.renderRiverPaths();
    this.renderBloomForecastMarkers();
  }

  setTileLayer(type: 'voyager' | 'satellite' | 'dark'): void {
    this.activeTileLayer.set(type);
    this.currentTileLayerGroup.clearLayers();

    let layerUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    let attribution = '&copy; CartoDB & OpenStreetMap';

    if (type === 'satellite') {
      layerUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri & Maxar';
    } else if (type === 'dark') {
      layerUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    }

    L.tileLayer(layerUrl, { 
      attribution, 
      maxZoom: 19,
      keepBuffer: 4,
      updateWhenIdle: true,
      errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    }).addTo(this.currentTileLayerGroup);
  }

  private renderRiverPaths(): void {
    this.riverLinesGroup.clearLayers();
    // Removed inaccurate dashed lines. Nodes now represent monitoring points.
  }

  private renderBloomForecastMarkers(): void {
    this.bloomForecastLayerGroup.clearLayers();
    this.markersLayerGroup.clearLayers();

    // Render 6 monitoring nodes
    this.riverNodes.forEach(node => {
      let colorClass = 'bg-emerald-500';
      let statusClass = 'background: #f1f5f9; color: #0f172a; border: 1px solid #e2e8f0;';
      if (node.status === 'WARNING') {
        colorClass = 'bg-amber-500';
        statusClass = 'background: #fffbeb; color: #d97706; border: 1px solid #fde68a;';
      }
      if (node.status === 'HAZARD') {
        colorClass = 'bg-rose-500';
        statusClass = 'background: #fef2f2; color: #e11d48; border: 1px solid #fecdd3;';
      }
      
      const nodeIcon = L.divIcon({
        className: 'custom-node-icon',
        html: `<div class="h-4 w-4 rounded-full border-2 border-white shadow-md ${colorClass}"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const nodePopup = `
        <div style="background: #ffffff; color: #0f172a; font-family: ui-sans-serif, system-ui, sans-serif; min-width: 220px; padding: 12px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <h4 style="margin: 0; font-weight: 700; font-size: 13px;">${node.name}</h4>
            <span style="font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 9999px; text-transform: uppercase; ${statusClass}">${node.status}</span>
          </div>
          <div style="margin-top: 10px; font-size: 11px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; border-top: 1px solid #f1f5f9; padding-top: 8px;">
            <div><div style="color: #64748b; margin-bottom: 2px;">pH</div><div style="font-weight: 700; font-family: monospace;">${node.ph.toFixed(1)}</div></div>
            <div><div style="color: #64748b; margin-bottom: 2px;">Temp</div><div style="font-weight: 700; font-family: monospace;">${node.temp.toFixed(1)}°C</div></div>
            <div><div style="color: #64748b; margin-bottom: 2px;">Cond</div><div style="font-weight: 700; font-family: monospace;">${node.ec} µS</div></div>
          </div>
        </div>
      `;
      L.marker([node.lat, node.lng], { icon: nodeIcon }).addTo(this.markersLayerGroup).bindPopup(nodePopup);
    });

    this.bloomForecasts.forEach(bf => {
      // Professional Radar DivIcon with Bio-Pulse SVG
      const forecastIcon = L.divIcon({
        className: 'custom-bloom-icon-container',
        html: `
          <div style="position: relative; width: 36px; height: 36px;">
            <div class="bloom-forecast-radar"></div>
            <div class="bloom-forecast-radar delay-1"></div>
            <div class="bloom-forecast-core">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1-1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
      });

      const marker = L.marker([bf.lat, bf.lng], { icon: forecastIcon }).addTo(this.bloomForecastLayerGroup);

      // Light Theme Early Warning Popup
      const popupHtml = `
        <div style="background: #ffffff; color: #0f172a; font-family: ui-sans-serif, system-ui, sans-serif; min-width: 250px; padding: 12px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="background: #fffbeb; color: #d97706; border: 1px solid #fde68a; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; text-transform: uppercase;">
              +${bf.forecastWindow} Early Warning
            </span>
            <span style="font-size: 10px; color: #64748b; font-family: monospace; font-weight: 600;">NIRVAAH XGBoost</span>
          </div>

          <h4 style="margin: 4px 0 2px 0; font-weight: 800; font-size: 14px; color: #0f172a;">${bf.name}</h4>
          <p style="margin: 0 0 10px 0; font-size: 11px; color: #0284c7; font-weight: 600;">${bf.river} • ${bf.location}</p>

          <div style="background: #f8fafc; padding: 8px 10px; border-radius: 8px; border: 1px solid #f1f5f9; margin-bottom: 10px; font-size: 11px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #475569; font-weight: 600;">Bloom Probability:</span>
              <span style="font-weight: 800; color: #d97706; font-family: monospace;">${bf.bloomProbability}%</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #475569; font-weight: 600;">Chlorophyll-a Est:</span>
              <span style="font-weight: 800; color: #059669; font-family: monospace;">${bf.predictedChl} mg/m³</span>
            </div>
          </div>

          <div style="font-size: 11px; color: #475569; margin-bottom: 8px; line-height: 1.4;">
            <b style="color: #0f172a;">Key Drivers:</b> ${bf.triggerFactors.join(', ')}
          </div>

          <div style="background: #ecfdf5; border-left: 3px solid #10b981; padding: 8px; border-radius: 4px; font-size: 10px; color: #047857; line-height: 1.4;">
            <b style="font-weight: 800;">Advisory:</b> ${bf.recommendation}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'custom-leaflet-popup',
        maxWidth: 300
      });
    });
  }

  toggleBloomForecast(): void {
    const nextState = !this.showBloomForecast();
    this.showBloomForecast.set(nextState);

    if (nextState) {
      this.renderBloomForecastMarkers();
    } else {
      this.bloomForecastLayerGroup.clearLayers();
    }
  }

  flyToBloom(bloom: BloomForecastNode): void {
    if (!this.showBloomForecast()) {
      this.toggleBloomForecast();
    }
    this.map?.flyTo([bloom.lat, bloom.lng], 14, { duration: 1.2 });
  }

  ngOnDestroy(): void {
    this.currentTileLayerGroup.clearLayers();
    this.riverLinesGroup.clearLayers();
    this.markersLayerGroup.clearLayers();
    this.bloomForecastLayerGroup.clearLayers();
    this.map?.remove();
  }
}
