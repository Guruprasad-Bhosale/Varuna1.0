import { Component, OnInit, signal, HostListener, DestroyRef, inject, ChangeDetectionStrategy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Camera, AlertCircle, Download, X, Search, Focus, Settings } from 'lucide-angular';

@Component({
  selector: 'app-camera-screening-panel',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './camera-screening-panel.component.html',
  styleUrls: ['./camera-screening-panel.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CameraScreeningPanelComponent implements OnInit {
  readonly CameraIcon = Camera;
  readonly AlertCircleIcon = AlertCircle;
  readonly DownloadIcon = Download;
  readonly CloseIcon = X;
  readonly SearchIcon = Search;
  readonly FocusIcon = Focus;
  readonly SettingsIcon = Settings;

  private destroyRef = inject(DestroyRef);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  lastUpdatedTimestamp = Date.now();
  detectedCount = signal<number>(132);
  viewMode = signal<'annotated' | 'raw' | 'mask'>('annotated');
  isModalOpen = signal<boolean>(false);
  isFlashing = signal<boolean>(false);

  syntheticPoints = Array.from({ length: 15 }).map(() => ({
    cx: `${30 + Math.random() * 40}%`,
    cy: `${20 + Math.random() * 60}%`,
    r: Math.random() * 3 + 1,
    x: `calc(${30 + Math.random() * 40}% - 4px)`,
    y: `calc(${20 + Math.random() * 60}% - 4px)`,
    color: Math.random() > 0.7 ? '#f43f5e' : (Math.random() > 0.4 ? '#f59e0b' : '#06b6d4'),
    id: `#P-${Math.floor(Math.random() * 99).toString().padStart(2, '0')}`
  }));

  recentSamples = [
    { time: 'Today 11:30 AM', count: 132, variance: '+18' },
    { time: 'Today 08:00 AM', count: 114, variance: '-5' },
    { time: 'Yesterday 04:00 PM', count: 119, variance: '+22' },
    { time: 'Yesterday 10:00 AM', count: 97, variance: '-1' }
  ];

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      const timer = setInterval(() => {
        this.lastUpdatedTimestamp = Date.now();
        this.detectedCount.update(c => Math.max(100, c + Math.floor(Math.random() * 7 - 3)));
        this.cdr.detectChanges();
      }, 2500);
      
      this.destroyRef.onDestroy(() => clearInterval(timer));
    });
  }

  get latestCaptureUrl(): string {
    return `http://localhost:8000/api/v1/captures/latest_screen.jpg?t=${this.lastUpdatedTimestamp}`;
  }

  captureFrame() {
    this.isFlashing.set(true);
    this.detectedCount.update(c => c + Math.floor(Math.random() * 10 - 2));
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.isFlashing.set(false);
        this.cdr.detectChanges();
      }, 150);
    });
  }

  setViewMode(mode: 'annotated' | 'raw' | 'mask') {
    this.viewMode.set(mode);
  }

  openComparisonModal() {
    this.isModalOpen.set(true);
  }

  closeComparisonModal() {
    this.isModalOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isModalOpen()) {
      this.closeComparisonModal();
    }
  }
}
