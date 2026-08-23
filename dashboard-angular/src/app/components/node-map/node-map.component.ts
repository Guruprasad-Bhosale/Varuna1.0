import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { TelemetryData } from '../../core/models/telemetry.model';
import { TelemetryService } from '../../services/telemetry.service';

@Component({
  selector: 'app-node-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './node-map.component.html',
  styleUrls: ['./node-map.component.css']
})
export class NodeMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() latestData: TelemetryData | null = null;
  @ViewChild('mapElement') mapElement!: ElementRef;

  private map!: L.Map;
  private marker!: L.Marker | L.CircleMarker;

  constructor(private telemetryService: TelemetryService) {}

  ngAfterViewInit() {
    this.initMap();
    this.loadHotspots();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['latestData'] && this.latestData && this.map) {
      this.updateMap();
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap() {
    const lat = this.latestData?.latitude || 16.142;
    const lng = this.latestData?.longitude || 73.528;

    this.map = L.map(this.mapElement.nativeElement, {
      center: [lat, lng],
      zoom: 14,
      zoomControl: true,
      scrollWheelZoom: false
    });

    // Use CartoDB Dark Matter for a sleeker dashboard look
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this.map);

    // Add a coverage radius to indicate sensor range
    L.circle([lat, lng], {
      color: '#0ea5e9',
      fillColor: '#0ea5e9',
      fillOpacity: 0.1,
      radius: 800, // 800 meters coverage
      weight: 1,
      dashArray: '4'
    }).addTo(this.map);

    this.createOrUpdateMarker(lat, lng);
  }

  private updateMap() {
    const lat = this.latestData?.latitude || 16.142;
    const lng = this.latestData?.longitude || 73.528;

    this.map.setView([lat, lng], this.map.getZoom());
    this.createOrUpdateMarker(lat, lng);
  }

  private createOrUpdateMarker(lat: number, lng: number) {
    const status = this.latestData?.predicted_safety_level || 'Safe';
    let color = '#10b981'; // safe
    if (status === 'Moderate') color = '#f59e0b';
    if (status === 'Dangerous') color = '#ef4444';

    // Animated pulsing marker
    const svgIcon = `
      <div class="relative flex items-center justify-center w-8 h-8">
        <span class="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" style="background-color: ${color}"></span>
        <span class="relative inline-flex rounded-full h-4 w-4 border-2 border-slate-900" style="background-color: ${color}"></span>
      </div>
    `;

    const icon = L.divIcon({
      html: svgIcon,
      className: 'bg-transparent border-0',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });

    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
      (this.marker as L.Marker).setIcon(icon);
    } else {
      this.marker = L.marker([lat, lng], { icon }).addTo(this.map);
    }

    const reasonsHtml = this.latestData?.reasons?.length ? `<div class="text-[10px] mt-1 text-red-500 font-semibold">${this.latestData.reasons.join(', ')}</div>` : '';
    const recomHtml = this.latestData?.recommendations?.length ? `<div class="text-[10px] mt-1 text-slate-600">${this.latestData.recommendations.join(', ')}</div>` : '';

    const popupContent = `
      <div class="p-1 font-sans">
        <div class="font-semibold text-slate-900 mb-1">${this.latestData?.node_id || 'JalDrishti-001'}</div>
        <div class="text-xs text-slate-700 mb-1">Status: <strong>${status}</strong></div>
        <div class="text-xs text-slate-500">Composite Score: ${this.latestData?.compositeScore || this.latestData?.safety_score || 0}/100</div>
        ${reasonsHtml}
        ${recomHtml}
        <div class="text-[10px] text-slate-500 mt-2">${lat.toFixed(4)}, ${lng.toFixed(4)}</div>
      </div>
    `;

    this.marker.bindPopup(popupContent);
  }

  async loadHotspots() {
    try {
      const hotspots = await this.telemetryService.getHotspots();
      hotspots.forEach((spot: { latitude: number; longitude: number }) => {
        L.circle([spot.latitude, spot.longitude], {
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.4,
          radius: 1200,
          weight: 0
        }).addTo(this.map).bindPopup(\`<div class="text-xs"><b>Algal Bloom Hotspot</b><br/>Lat: \${spot.latitude.toFixed(3)}, Lng: \${spot.longitude.toFixed(3)}</div>\`);
      });
    } catch (e) {
      console.error("Failed to load hotspots", e);
    }
  }
}
