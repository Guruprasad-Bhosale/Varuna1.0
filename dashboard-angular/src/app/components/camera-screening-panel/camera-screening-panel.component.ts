import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Camera, AlertCircle } from 'lucide-angular';

@Component({
  selector: 'app-camera-screening-panel',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './camera-screening-panel.component.html',
  styleUrls: ['./camera-screening-panel.component.css']
})
export class CameraScreeningPanelComponent implements OnInit {
  readonly CameraIcon = Camera;
  readonly AlertCircleIcon = AlertCircle;

  lastUpdatedTimestamp = Date.now();
  syntheticPoints = Array.from({ length: 15 }).map(() => ({
    cx: `${30 + Math.random() * 40}%`,
    cy: `${20 + Math.random() * 60}%`,
    r: Math.random() * 3 + 1,
    x: `calc(${30 + Math.random() * 40}% - 4px)`,
    y: `calc(${20 + Math.random() * 60}% - 4px)`
  }));

  ngOnInit() {
    setInterval(() => {
      this.lastUpdatedTimestamp = Date.now();
    }, 5000);
  }

  // Cache-Busting Image URL logic as requested
  get latestCaptureUrl(): string {
    return `http://localhost:8000/api/v1/captures/latest_screen.jpg?t=${this.lastUpdatedTimestamp}`;
  }
}
