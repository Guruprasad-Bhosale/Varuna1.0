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
  confidence = 0;
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
    this.score = this.latestData?.safety_score || 0;
    this.level = this.latestData?.predicted_safety_level || "Safe";
    this.confidence = this.latestData?.confidence_pct || 0;

    this.statusColor = "text-safe";
    this.statusBg = "bg-safeBg";
    this.arcColor = "#16a34a";
    this.message = "Suitable under current monitored conditions";

    if (this.level === "Moderate") {
      this.statusColor = "text-moderate";
      this.statusBg = "bg-moderateBg";
      this.arcColor = "#d97706";
      this.message = "Water quality degraded. Exercise caution.";
    } else if (this.level === "Dangerous") {
      this.statusColor = "text-dangerous";
      this.statusBg = "bg-dangerousBg";
      this.arcColor = "#dc2626";
      this.message = "Hazardous conditions detected. Immediate attention required.";
    }

    const radius = 60;
    this.circumference = Math.PI * radius;
    this.dashoffset = this.circumference - (this.score / 100) * this.circumference;
  }
}
