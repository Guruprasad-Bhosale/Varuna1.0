import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { TelemetryData } from '../../services/telemetry.service';

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

  ngAfterViewInit() {
    this.initMap();
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
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
    let color = '#16a34a'; // safe
    if (status === 'Moderate') color = '#d97706';
    if (status === 'Dangerous') color = '#dc2626';

    const svgIcon = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#ffffff" stroke-width="2"/>
        <circle cx="12" cy="10" r="3" fill="#ffffff"/>
      </svg>
    `;

    const icon = L.divIcon({
      html: svgIcon,
      className: 'custom-leaflet-icon',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24]
    });

    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
      (this.marker as L.Marker).setIcon(icon);
    } else {
      this.marker = L.marker([lat, lng], { icon }).addTo(this.map);
    }

    const popupContent = `
      <div class="p-1 font-sans">
        <div class="font-semibold text-slate-900 mb-1">${this.latestData?.node_id || 'VARUNA-001'}</div>
        <div class="text-xs text-slate-700 mb-1">Status: <strong>${status}</strong></div>
        <div class="text-xs text-slate-500">WQI Score: ${this.latestData?.safety_score || 0}/100</div>
        <div class="text-[10px] text-slate-500 mt-2">${lat.toFixed(4)}, ${lng.toFixed(4)}</div>
      </div>
    `;

    this.marker.bindPopup(popupContent);
  }
}
