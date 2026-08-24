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
          <p class="text-xs text-slate-600 mt-1 font-medium">
            Real-time telemetry and 48–72h AI predictive algal bloom early warning zones
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <!-- Swath Layer Toggle -->
          <button 
            (click)="toggleSwath()"
            [ngClass]="showSwath() ? 'bg-slate-900 text-white' : 'bg-white text-slate-800 hover:bg-slate-50'"
            class="px-4 py-2 border border-slate-300 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2">
            Satellite Risk Swath
          </button>

          <!-- Bloom Forecast Layer Toggle -->
          <button 
            (click)="toggleBloomForecast()"
            [ngClass]="showBloomForecast() ? 'bg-slate-900 text-white' : 'bg-white text-slate-800 hover:bg-slate-50'"
            class="px-4 py-2 border border-slate-300 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2">
            <span class="relative flex h-2 w-2">
              @if (showBloomForecast()) {
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              }
              <span class="relative inline-flex rounded-full h-2 w-2" [ngClass]="showBloomForecast() ? 'bg-emerald-400' : 'bg-slate-500'"></span>
            </span>
            48–72h Bloom Forecast
          </button>

          <!-- Tile Selector -->
          <div class="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm text-xs">
            <button (click)="setTileLayer('voyager')" [ngClass]="activeTileLayer() === 'voyager' ? 'bg-slate-900 text-white' : 'text-slate-700 bg-transparent hover:bg-slate-100'" class="px-3 py-1 rounded-lg font-bold transition-all">Voyager</button>
            <button (click)="setTileLayer('satellite')" [ngClass]="activeTileLayer() === 'satellite' ? 'bg-slate-900 text-white' : 'text-slate-700 bg-transparent hover:bg-slate-100'" class="px-3 py-1 rounded-lg font-bold transition-all">Satellite</button>
            <button (click)="setTileLayer('dark')" [ngClass]="activeTileLayer() === 'dark' ? 'bg-slate-900 text-white' : 'text-slate-700 bg-transparent hover:bg-slate-100'" class="px-3 py-1 rounded-lg font-bold transition-all">Dark</button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div class="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative h-[420px] sm:h-[500px] lg:h-[640px]">
          <div id="sindhudurg-gis-map" class="h-full w-full"></div>
          
          <!-- High-Contrast Floating Map Legend -->
          <div class="absolute bottom-6 left-6 z-[1000] bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-4 w-64 shadow-lg space-y-3 pointer-events-auto">
            <div class="flex items-center justify-between border-b border-slate-100 pb-2">
              <span class="text-xs font-bold text-slate-900 tracking-tight uppercase">Map Legend</span>
              <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                NIRVAAH AI
              </span>
            </div>

            <!-- River Polyline Traces -->
            <div class="space-y-1.5 text-xs font-semibold text-slate-700">
              <div class="flex items-center gap-2">
                <span class="h-1.5 w-5 rounded-full bg-cyan-500"></span>
                <span>Gad River Channel</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="h-1.5 w-5 rounded-full bg-teal-600"></span>
                <span>Karli River Channel</span>
              </div>
            </div>

            <div class="border-t border-slate-100 pt-2 space-y-2 text-xs font-medium text-slate-700">
              <!-- Active Station Pins -->
              <div class="flex items-center gap-2">
                <span class="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
                <span>Safe Monitoring Station</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-rose-200"></span>
                <span>Active Hazard Station</span>
              </div>
              <!-- 48-72h Radar Markers -->
              <div class="flex items-center gap-2">
                <span class="relative flex h-2.5 w-2.5">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <span>Predicted Bloom (48–72h)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Dual-Mode Intelligence Sidebar -->
        <div class="space-y-4">
          <div class="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button (click)="activeTab.set('stations')" [ngClass]="activeTab() === 'stations' ? 'bg-slate-900 text-white' : 'text-slate-700 bg-transparent hover:bg-slate-100'" class="flex-1 py-2 text-xs font-bold rounded-lg transition-all">River Stations</button>
            <button (click)="activeTab.set('forecasts')" [ngClass]="activeTab() === 'forecasts' ? 'bg-slate-900 text-white' : 'text-slate-700 bg-transparent hover:bg-slate-100'" class="flex-1 py-2 text-xs font-bold rounded-lg transition-all">Bloom Warnings</button>
          </div>

          <div class="space-y-3 max-h-[580px] overflow-y-auto pr-1 pb-4">
            @if (activeTab() === 'stations') {
              @for (node of riverNodes; track node.id; let i = $index) {
                <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-teal-400 hover:shadow-md transition-all space-y-3">
                  <div class="flex items-start justify-between gap-2">
                    <div class="font-bold text-sm text-slate-900 tracking-tight">{{ node.name }}</div>
                    <div class="h-2.5 w-2.5 rounded-full shrink-0 mt-1" [ngClass]="node.status === 'SAFE' ? 'bg-emerald-500' : (node.status === 'ELEVATED' ? 'bg-amber-400' : 'bg-rose-500')"></div>
                  </div>
                  
                  <div class="text-xs font-mono font-medium text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    pH: {{ node.ph.toFixed(2) }} • Temp: {{ node.temp.toFixed(1) }}°C • Cond: {{ node.ec }} µS
                  </div>

                  <div class="flex items-center justify-between text-xs pt-1">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                          [ngClass]="node.status === 'SAFE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : (node.status === 'ELEVATED' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200')">
                      {{ node.status }}
                    </span>
                    <button (click)="flyToNode(node)" class="bg-slate-900 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Inspect &rarr;</button>
                  </div>
                </div>
              }
            } @else {
              @for (bloom of bloomForecasts; track bloom.id; let i = $index) {
                <div 
                  (click)="flyToBloom(bloom)"
                  class="bg-amber-50/60 rounded-xl border border-amber-200 p-4 shadow-sm hover:border-amber-400 hover:shadow-md transition-all space-y-3 cursor-pointer group">
                  
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <div class="font-bold text-sm text-slate-900 transition-colors">
                        {{ bloom.name }}
                      </div>
                      <div class="text-xs text-teal-700 font-semibold mt-0.5">{{ bloom.river }} • {{ bloom.location }}</div>
                    </div>
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 font-mono shrink-0">
                      +{{ bloom.forecastWindow }}
                    </span>
                  </div>

                  <div class="bg-white border border-amber-200/80 p-2.5 rounded-lg text-xs font-mono font-bold space-y-1.5">
                    <div class="flex justify-between items-center text-slate-700">
                      <span>Probability:</span>
                      <span class="text-rose-600">{{ bloom.bloomProbability }}%</span>
                    </div>
                    <div class="flex justify-between items-center text-slate-700">
                      <span>Est. Chlorophyll:</span>
                      <span class="text-teal-700">{{ bloom.predictedChl }} mg/m³</span>
                    </div>
                  </div>

                  <div class="text-xs text-slate-700 font-medium leading-relaxed">
                    <span class="font-bold text-slate-900">Triggers:</span> {{ bloom.triggerFactors.join(', ') }}
                  </div>

                  <div class="flex items-center justify-between text-xs pt-1">
                    <span class="text-xs text-amber-900 font-bold uppercase bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">{{ bloom.riskTier }}</span>
                    <button class="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold group-hover:bg-amber-600 transition-colors">Inspect &rarr;</button>
                  </div>
                </div>
              }
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
  showSwath = signal<boolean>(false);
  activeTab = signal<'stations' | 'forecasts'>('stations');
  selectedStation = signal<{ id: string; name: string; lat: number; lng: number; status: string; ph: number; temp: number; ec: number } | null>(null);

  private map?: L.Map;
  private currentTileLayerGroup = new L.LayerGroup();
  private markersLayerGroup = new L.LayerGroup();
  private bloomForecastLayerGroup = new L.LayerGroup();
  private riverLinesGroup = new L.LayerGroup();
  private swathLayerGroup = new L.LayerGroup();
  private sharedCanvasRenderer = L.canvas({ padding: 0.5, tolerance: 8 });

  // 48h to 72h Predictive Algal Bloom Forecast Points
  readonly bloomForecasts: BloomForecastNode[] = [
    {
      id: 'BLOOM-FC-01',
      name: 'Sarjekot Estuary Confluence',
      location: 'Malvan Coastal Outfall',
      river: 'Gad River',
      lat: 16.0822,
      lng: 73.4685,
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
      lat: 15.9765,
      lng: 73.4925,
      forecastWindow: '72h',
      bloomProbability: 78.2,
      predictedChl: 6.90,
      triggerFactors: ['Agricultural Runoff Inflow', 'Elevated EC (1,420 µS/cm)', 'Solar Irradiance Spike'],
      riskTier: 'Elevated',
      recommendation: 'Alert coastal aquaculture units and increase automated sampling frequency.'
    }
  ];

  readonly riverNodes = [
    { id: 'SAGARDRISHTI-001', name: 'SAGARDRISHTI-001 (Sarjekot Outfall)', lat: 16.0822, lng: 73.4685, status: 'SAFE', ph: 7.35, temp: 25.1, ec: 420 },
    { id: 'SAGARDRISHTI-002', name: 'SAGARDRISHTI-002 (Kasal Basin)', lat: 16.1850, lng: 73.6120, status: 'SAFE', ph: 7.4, temp: 24.2, ec: 310 },
    { id: 'SAGARDRISHTI-003', name: 'SAGARDRISHTI-003 (Kudal Bridge)', lat: 15.9985, lng: 73.6840, status: 'ELEVATED', ph: 7.8, temp: 26.5, ec: 850 },
    { id: 'SAGARDRISHTI-004', name: 'SAGARDRISHTI-004 (Devbag Creek)', lat: 15.9765, lng: 73.4925, status: 'WARNING', ph: 8.15, temp: 28.1, ec: 1120 }
  ];

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.initMap();
      
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 50);
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
    this.swathLayerGroup.addTo(this.map);
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
    
    // Gad River Path (Flowing West from Sahyadri foothills to Sarjekot Harbor)
    const gadRiverChannel: [number, number][] = [
      [16.2750, 73.7420],
      [16.2280, 73.6750],
      [16.1850, 73.6120], // SAGARDRISHTI-002 Station
      [16.1380, 73.5450],
      [16.1020, 73.4980],
      [16.0822, 73.4685]  // SAGARDRISHTI-001 Estuary Outfall
    ];
    L.polyline(gadRiverChannel, {
      color: '#06b6d4',
      weight: 4,
      opacity: 0.85,
      dashArray: '6, 8'
    }).addTo(this.riverLinesGroup);

    // Karli River Path (Flowing Southwest through Kudal to Devbag Spit)
    const karliRiverChannel: [number, number][] = [
      [16.0420, 73.7850],
      [15.9985, 73.6840], // SAGARDRISHTI-003 Station
      [15.9890, 73.6150],
      [15.9810, 73.5420],
      [15.9765, 73.4925]  // SAGARDRISHTI-004 Estuary Outfall
    ];
    L.polyline(karliRiverChannel, {
      color: '#0d9488',
      weight: 4,
      opacity: 0.85,
      dashArray: '6, 8'
    }).addTo(this.riverLinesGroup);
  }

  private generateSwathData(): { lat: number; lng: number; prob: number; color: string }[] {
    const points = [];
    for (let lat = 15.80; lat <= 17.50; lat += 0.1) {
      for (let lng = 72.75; lng <= 73.45; lng += 0.1) {
        // Add slight organic coordinate jitter to emulate satellite raster cells
        const jitterLat = lat + (Math.random() * 0.02 - 0.01);
        const jitterLng = lng + (Math.random() * 0.02 - 0.01);
        
        // Calculate realistic probability gradient: higher risk near shallow estuarine mouths
        const nearEstuary = Math.abs(jitterLat - 16.08) < 0.15 || Math.abs(jitterLat - 15.98) < 0.15;
        const prob = nearEstuary 
          ? Math.floor(65 + Math.random() * 25) 
          : Math.floor(10 + Math.random() * 45);

        const color = prob >= 80 ? '#ef4444' : prob >= 55 ? '#f97316' : prob >= 25 ? '#eab308' : '#10b981';
        points.push({ lat: jitterLat, lng: jitterLng, prob, color });
      }
    }
    return points;
  }

  private renderSwathMarkers(): void {
    this.swathLayerGroup.clearLayers();
    const swathData = this.generateSwathData();

    swathData.forEach(pt => {
      L.circleMarker([pt.lat, pt.lng], {
        renderer: this.sharedCanvasRenderer,
        radius: 4,
        fillColor: pt.color,
        color: '#0f172a',
        weight: 1,
        fillOpacity: 0.85
      }).bindTooltip(
        `<b>Lat:</b> ${pt.lat.toFixed(4)}° N | <b>Lng:</b> ${pt.lng.toFixed(4)}° E<br/><b>Bloom Risk:</b> ${pt.prob}%`,
        { sticky: true, className: 'custom-swath-leaflet-tooltip' }
      ).addTo(this.swathLayerGroup);
    });
  }

  toggleSwath(): void {
    const nextState = !this.showSwath();
    this.showSwath.set(nextState);
    if (nextState) {
      this.renderSwathMarkers();
    } else {
      this.swathLayerGroup.clearLayers();
    }
  }

  private renderBloomForecastMarkers(): void {
    this.bloomForecastLayerGroup.clearLayers();
    this.markersLayerGroup.clearLayers();

    // Render monitoring nodes
    this.riverNodes.forEach(node => {
      let colorClass = 'bg-emerald-500';
      let statusClass = 'background: #f1f5f9; color: #0f172a; border: 1px solid #e2e8f0;';
      if (node.status === 'ELEVATED') {
        colorClass = 'bg-amber-400';
        statusClass = 'background: #fffbeb; color: #d97706; border: 1px solid #fde68a;';
      }
      if (node.status === 'WARNING' || node.status === 'HAZARD') {
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
      const marker = L.marker([node.lat, node.lng], { icon: nodeIcon }).addTo(this.markersLayerGroup).bindPopup(nodePopup);
      marker.on('click', () => {
        this.ngZone.run(() => {
          this.selectedStation.set(node);
        });
      });
    });

    this.bloomForecasts.forEach(bf => {
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

  flyToNode(node: { id: string; name: string; lat: number; lng: number; status: string; ph: number; temp: number; ec: number }): void {
    this.map?.flyTo([node.lat, node.lng], 14, { duration: 1.2 });
  }

  ngOnDestroy(): void {
    this.currentTileLayerGroup.clearLayers();
    this.riverLinesGroup.clearLayers();
    this.swathLayerGroup.clearLayers();
    this.markersLayerGroup.clearLayers();
    this.bloomForecastLayerGroup.clearLayers();
    this.map?.remove();
  }
}
