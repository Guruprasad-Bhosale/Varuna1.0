import { Component, AfterViewInit, OnDestroy, signal, inject, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Map as MapIcon } from 'lucide-angular';
import * as L from 'leaflet';
import { TelemetryService } from '../../../../services/telemetry.service';

export interface RiverStation {
  id: string;
  name: string;
  basin: string;
  lat: number;
  lng: number;
  status: 'Safe' | 'Moderate' | 'Dangerous';
  safetyScore: number;
  ph: number;
  turbidity: number;
  ec: number;
  temp: number;
}

@Component({
  selector: 'app-river-nodes-view',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- Header Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
            <i-lucide name="map" class="h-6 w-6 text-cyan-600"></i-lucide>
            GIS River Basin Network
          </h2>
          <p class="text-xs text-slate-500 mt-1">
            Real-time geospatial telemetry across monitored river sections
          </p>
        </div>

        <!-- Layer Selector -->
        <div class="flex items-center space-x-2 bg-white/80 p-1.5 rounded-xl border border-slate-200 text-xs">
          <button 
            (click)="setTileLayer('dark')"
            [ngClass]="activeTileLayer() === 'dark' ? 'bg-cyan-50 text-cyan-600 border-cyan-200' : 'text-slate-500'"
            class="px-3 py-1.5 rounded-lg border border-transparent font-medium transition-all">
            Dark Vector
          </button>
          <button 
            (click)="setTileLayer('satellite')"
            [ngClass]="activeTileLayer() === 'satellite' ? 'bg-cyan-50 text-cyan-600 border-cyan-200' : 'text-slate-500'"
            class="px-3 py-1.5 rounded-lg border border-transparent font-medium transition-all">
            Satellite
          </button>
          <button 
            (click)="setTileLayer('osm')"
            [ngClass]="activeTileLayer() === 'osm' ? 'bg-cyan-50 text-cyan-600 border-cyan-200' : 'text-slate-500'"
            class="px-3 py-1.5 rounded-lg border border-transparent font-medium transition-all">
            Standard
          </button>
        </div>
      </div>

      <!-- Main GIS Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Leaflet Map Container -->
        <div class="lg:col-span-3 rounded-2xl border border-slate-200 bg-white/60 overflow-hidden relative shadow-md h-[380px] sm:h-[480px] lg:h-[640px]" style="isolation: isolate; z-index: 1;">
          <div id="gis-leaflet-map" class="h-full w-full" style="touch-action: pan-x pan-y;"></div>
          
          <!-- Map Legend Overlay -->
          <div class="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-md p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1.5 shadow-xl">
            <div class="font-semibold text-slate-800 mb-1">Water Quality Status</div>
            <div class="flex items-center space-x-2"><span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span><span>Safe (WQI ≥ 75)</span></div>
            <div class="flex items-center space-x-2"><span class="h-2.5 w-2.5 rounded-full bg-amber-500"></span><span>Moderate (WQI 50–74)</span></div>
            <div class="flex items-center space-x-2"><span class="h-2.5 w-2.5 rounded-full bg-rose-500"></span><span>Dangerous (WQI < 50)</span></div>
          </div>
        </div>

        <!-- Station Inspector Dock -->
        <div class="space-y-4">
          <div class="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Active Station Nodes ({{ stations.length }})
          </div>

          <div class="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            @for (st of stations; track st.id) {
              <div 
                (click)="flyToStation(st)"
                [ngClass]="selectedStation()?.id === st.id ? 'border-cyan-300 bg-cyan-50' : 'border-slate-200 bg-white hover:border-slate-300'"
                class="p-4 rounded-xl border transition-all cursor-pointer space-y-3 shadow-sm">
                <div class="flex items-start justify-between">
                  <div>
                    <div class="font-semibold text-sm text-slate-800">{{ st.name }}</div>
                    <div class="text-xs text-slate-500">{{ st.basin }}</div>
                  </div>
                  <span 
                    [ngClass]="{
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/30': st.status === 'Safe',
                      'bg-amber-500/10 text-amber-400 border-amber-500/30': st.status === 'Moderate',
                      'bg-rose-500/10 text-rose-400 border-rose-500/30': st.status === 'Dangerous'
                    }"
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold border">
                    {{ st.status }}
                  </span>
                </div>

                <div class="grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div><span class="text-slate-500">pH:</span> {{ st.ph }}</div>
                  <div><span class="text-slate-500">NTU:</span> {{ st.turbidity }}</div>
                  <div><span class="text-slate-500">EC:</span> {{ st.ec }}</div>
                </div>

                <div class="flex items-center justify-between text-xs text-cyan-600 hover:text-cyan-700 pt-1">
                  <span class="text-[11px] text-slate-500">Score: {{ st.safetyScore }}/100</span>
                  <span class="flex items-center gap-1 font-medium">Pan to Node &rarr;</span>
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
  activeTileLayer = signal<'dark' | 'satellite' | 'osm'>('osm');
  selectedStation = signal<RiverStation | null>(null);

  private map?: L.Map;
  private currentTileLayerGroup = new L.LayerGroup();
  private markersLayerGroup = new L.LayerGroup();
  private riverLinesGroup = new L.LayerGroup();

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private ngZone = inject(NgZone);
  private resizeObserver?: ResizeObserver;

  readonly stations: RiverStation[] = [
    {
      id: 'VARUNA-001',
      name: 'Station 001 (Gad River - Kankavli Inflow)',
      basin: 'Sindhudurg - Gad River Catchment',
      lat: 16.2700,
      lng: 73.7150,
      status: 'Safe',
      safetyScore: 88,
      ph: 7.42,
      turbidity: 6,
      ec: 380,
      temp: 26.5
    },
    {
      id: 'VARUNA-002',
      name: 'Station 002 (Gad River - Sarjekot Estuary)',
      basin: 'Malvan Coastal Confluence',
      lat: 16.0750,
      lng: 73.4750,
      status: 'Moderate',
      safetyScore: 62,
      ph: 7.85,
      turbidity: 18,
      ec: 840,
      temp: 28.2
    },
    {
      id: 'VARUNA-003',
      name: 'Station 003 (Karli River - Kudal Industrial Zone)',
      basin: 'Midstream Karli Basin',
      lat: 16.0080,
      lng: 73.6820,
      status: 'Dangerous',
      safetyScore: 34,
      ph: 5.90,
      turbidity: 48,
      ec: 1650,
      temp: 31.0
    },
    {
      id: 'VARUNA-004',
      name: 'Station 004 (Karli River - Tarkarli Creek)',
      basin: 'Devbag Coastal Estuary',
      lat: 15.9850,
      lng: 73.4900,
      status: 'Safe',
      safetyScore: 82,
      ph: 7.60,
      turbidity: 9,
      ec: 520,
      temp: 27.4
    }
  ];

  ngAfterViewInit(): void {
    this.initMap();
    
    this.ngZone.runOutsideAngular(() => {
      let resizeTimeout: any;
      const mapContainer = L.DomUtil.get('gis-leaflet-map');
      if (mapContainer) {
        this.resizeObserver = new ResizeObserver(() => {
          if (resizeTimeout) clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
            this.map?.invalidateSize();
          }, 50);
        });
        this.resizeObserver.observe(mapContainer);
      }
    });
  }

  private initMap(): void {
    const container = L.DomUtil.get('gis-leaflet-map');
    if(container != null){
      // This helps with the 'Map container is already initialized' error if switching fast
      (container as any)._leaflet_id = null;
    }

    this.map = L.map('gis-leaflet-map', {
      center: [16.1200, 73.6200],
      zoom: 11,
      preferCanvas: true,
      tap: true,
      zoomControl: false
    } as any);
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    this.currentTileLayerGroup.addTo(this.map);
    this.riverLinesGroup.addTo(this.map);
    this.markersLayerGroup.addTo(this.map);

    this.setTileLayer('osm');
    this.renderRiverPath();
    this.renderStationMarkers();

    const basinBounds = L.featureGroup([this.riverLinesGroup as any, this.markersLayerGroup as any]).getBounds();
    if (basinBounds.isValid()) {
      this.map.fitBounds(basinBounds.pad(0.15));
    }
  }

  setTileLayer(type: 'dark' | 'satellite' | 'osm'): void {
    this.activeTileLayer.set(type);
    this.currentTileLayerGroup.clearLayers();

    let layerUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    let attribution = '&copy; CartoDB & OpenStreetMap';

    if (type === 'satellite') {
      layerUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri & Maxar';
    } else if (type === 'osm') {
      layerUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }

    L.tileLayer(layerUrl, { 
      attribution, 
      maxZoom: 19,
      keepBuffer: 4,
      updateWhenIdle: true,
      errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    }).addTo(this.currentTileLayerGroup);
  }

  private renderRiverPath(): void {
    if (!this.map) return;
    this.riverLinesGroup.clearLayers();

    const gadCoords: [number, number][] = [[16.3200, 73.8000], [16.2700, 73.7150], [16.1800, 73.6000], [16.1200, 73.5200], [16.0750, 73.4750]];
    const karliCoords: [number, number][] = [[16.0500, 73.8200], [16.0080, 73.6820], [15.9950, 73.5800], [15.9850, 73.4900]];

    L.polyline(gadCoords, {
      color: '#06b6d4',
      weight: 4,
      opacity: 0.8,
      dashArray: '8, 8',
      className: 'flow-dash-animation'
    }).addTo(this.riverLinesGroup);

    L.polyline(karliCoords, {
      color: '#0d9488',
      weight: 4,
      opacity: 0.8,
      dashArray: '8, 8',
      className: 'flow-dash-animation'
    }).addTo(this.riverLinesGroup);
  }

  private renderStationMarkers(): void {
    this.markersLayerGroup.clearLayers();

    this.stations.forEach(st => {
      const color = st.status === 'Dangerous' ? '#f43f5e' : (st.status === 'Moderate' ? '#f59e0b' : '#10b981');
      const pulseColor = st.status === 'Dangerous' ? 'rgba(244,63,94,0.4)' : (st.status === 'Moderate' ? 'rgba(245,158,11,0.4)' : 'rgba(16,185,129,0.4)');

      const customIcon = L.divIcon({
        className: 'custom-pulse-marker',
        html: `
          <div style="position: relative; width: 24px; height: 24px;">
            <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: ${pulseColor}; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; top: 4px; left: 4px; width: 16px; height: 16px; border-radius: 50%; background: ${color}; border: 2px solid #ffffff; box-shadow: 0 0 10px ${color};"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([st.lat, st.lng], { icon: customIcon }).addTo(this.markersLayerGroup);

      const popupHtml = `
        <div style="color: #0f172a; font-family: sans-serif; min-width: 180px;">
          <h4 style="margin: 0; font-weight: bold; font-size: 14px;">${st.name}</h4>
          <p style="margin: 2px 0 8px; color: #64748b; font-size: 11px;">${st.basin}</p>
          <div style="background: #f1f5f9; padding: 6px 8px; border-radius: 6px; font-size: 11px; font-family: monospace;">
            <div>pH: <b>${st.ph}</b> | Turb: <b>${st.turbidity} NTU</b></div>
            <div>EC: <b>${st.ec} µS/cm</b> | Temp: <b>${st.temp}°C</b></div>
          </div>
          <div style="margin-top: 8px; font-weight: bold; font-size: 12px; color: ${color}; display: flex; justify-content: space-between; align-items: center;">
            <span>Score: ${st.safetyScore} / 100</span>
            <button class="live-telemetry-btn" style="background: none; border: none; color: #0284c7; cursor: pointer; font-size: 11px; font-weight: bold;">Live Telemetry &rarr;</button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', (e) => {
        const btn = e.popup.getElement()?.querySelector('.live-telemetry-btn');
        if (btn) {
          btn.addEventListener('click', () => {
            this.router.navigate([], { queryParams: { tab: 'live' }, queryParamsHandling: 'merge' });
          });
        }
      });
    });
  }

  flyToStation(st: RiverStation): void {
    this.selectedStation.set(st);
    this.map?.flyTo([st.lat, st.lng], 15, { duration: 1.5 });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.riverLinesGroup.clearLayers();
    this.markersLayerGroup.clearLayers();
    this.currentTileLayerGroup.clearLayers();
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }
}
