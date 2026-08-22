import { Component, AfterViewInit, OnDestroy, signal, ChangeDetectionStrategy, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
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
            <i-lucide name="map" class="h-6 w-6 text-teal-600"></i-lucide>
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

    const gadCoords: [number, number][] = [
      [16.3200, 73.8000],
      [16.2700, 73.7150],
      [16.1800, 73.6000],
      [16.1200, 73.5200],
      [16.0750, 73.4750]
    ];
    L.polyline(gadCoords, { color: '#06b6d4', weight: 4, opacity: 0.85, dashArray: '6, 8' }).addTo(this.riverLinesGroup);

    const karliCoords: [number, number][] = [
      [16.0500, 73.8200],
      [16.0080, 73.6820],
      [15.9950, 73.5800],
      [15.9850, 73.4900]
    ];
    L.polyline(karliCoords, { color: '#2dd4bf', weight: 4, opacity: 0.85, dashArray: '6, 8' }).addTo(this.riverLinesGroup);
  }

  private renderBloomForecastMarkers(): void {
    this.bloomForecastLayerGroup.clearLayers();

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

      // Glassmorphic Early Warning Popup
      const popupHtml = `
        <div style="background: #090d16; color: #f8fafc; font-family: ui-sans-serif, system-ui, sans-serif; min-width: 250px; padding: 12px; border-radius: 12px; border: 1px solid rgba(245, 158, 11, 0.35); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.8);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; text-transform: uppercase;">
              +${bf.forecastWindow} Early Warning
            </span>
            <span style="font-size: 10px; color: #94a3b8; font-family: monospace;">NIRVAAH XGBoost</span>
          </div>

          <h4 style="margin: 4px 0 2px 0; font-weight: 700; font-size: 13px; color: #ffffff;">${bf.name}</h4>
          <p style="margin: 0 0 8px 0; font-size: 11px; color: #38bdf8;">${bf.river} • ${bf.location}</p>

          <div style="background: #020617; padding: 8px 10px; border-radius: 8px; border: 1px solid #1e293b; margin-bottom: 8px; font-size: 11px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #94a3b8;">Bloom Probability:</span>
              <span style="font-weight: 700; color: #fbbf24; font-family: monospace;">${bf.bloomProbability}%</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #94a3b8;">Chlorophyll-a Est:</span>
              <span style="font-weight: 700; color: #34d399; font-family: monospace;">${bf.predictedChl} mg/m³</span>
            </div>
          </div>

          <div style="font-size: 11px; color: #cbd5e1; margin-bottom: 6px; line-height: 1.3;">
            <b style="color: #e2e8f0;">Key Drivers:</b> ${bf.triggerFactors.join(', ')}
          </div>

          <div style="background: rgba(16, 185, 129, 0.1); border-left: 3px solid #10b981; padding: 6px 8px; border-radius: 4px; font-size: 10px; color: #a7f3d0; line-height: 1.3;">
            <b>Advisory:</b> ${bf.recommendation}
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
