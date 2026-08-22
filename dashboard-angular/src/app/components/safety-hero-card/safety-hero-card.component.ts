import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, MapPin, Battery, Wifi, Clock, ArrowRight } from 'lucide-angular';
import { TelemetryData } from '../../services/telemetry.service';

@Component({
  selector: 'app-safety-hero-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './safety-hero-card.component.html',
  styleUrls: ['./safety-hero-card.component.css']
})
export class SafetyHeroCardComponent implements OnChanges {
  @Input() latestData: TelemetryData | null = null;

  score = 0;
  level = "Safe";
  statusColor = "text-safe";
  statusBg = "bg-safeBg";
  arcColor = "#16a34a";
  message = "Suitable under current monitored conditions";
  dashoffset = Math.PI * 60;
  circumference = Math.PI * 60;

  readonly MapPinIcon = MapPin;
  readonly BatteryIcon = Battery;
  readonly WifiIcon = Wifi;
  readonly ClockIcon = Clock;
  readonly ArrowRightIcon = ArrowRight;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['latestData'] && this.latestData) {
      this.updateStatus();
    }
  }

  private updateStatus() {
    this.score = this.latestData?.compositeScore || 0;
    this.level = this.latestData?.status || "SAFE";

    this.statusColor = "text-safe";
    this.statusBg = "bg-safeBg";
    this.arcColor = "#16a34a";
    this.message = "Suitable under current monitored conditions";

    if (this.level.toUpperCase() === "MODERATE") {
      this.statusColor = "text-amber-600";
      this.statusBg = "bg-amber-50";
      this.arcColor = "#d97706";
      this.message = "Water quality degraded. Exercise caution.";
    } else if (this.level.toUpperCase() === "DANGEROUS" || this.level.toUpperCase() === "HAZARD") {
      this.statusColor = "text-rose-600";
      this.statusBg = "bg-rose-50";
      this.arcColor = "#dc2626";
      this.message = "Hazardous conditions detected. Immediate attention required.";
    }

    const radius = 60;
    this.circumference = Math.PI * radius;
    this.dashoffset = this.circumference - (this.score / 100) * this.circumference;
  }

  get confidenceValue(): number {
    return this.latestData?.confidence ?? this.latestData?.confidence_pct ?? 94.8;
  }
}
