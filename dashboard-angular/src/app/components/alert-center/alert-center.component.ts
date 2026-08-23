import { Component, Input, OnChanges, SimpleChanges, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-angular';

export interface Alert {
  id: string;
  timestamp: string;
  timeAgo: string;
  station: string;
  river: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  parameters: string;
  status: 'ACTIVE' | 'RESOLVED' | 'DISPATCHED';
}

@Component({
  selector: 'app-alert-center',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './alert-center.component.html',
  styleUrls: ['./alert-center.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertCenterComponent implements OnChanges {
  @Input() alerts: Alert[] = [];

  readonly AlertCircleIcon = AlertCircle;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly CheckCircleIcon = CheckCircle;

  private alertAudio: HTMLAudioElement | null = null;
  private isAudioUnlocked = false;
  public isMuted = false;

  // Unlock audio on the first user interaction anywhere on the document
  @HostListener('document:click')
  unlockAudio(): void {
    if (!this.isAudioUnlocked) {
      this.alertAudio = new Audio(''); // Dummy for now
      this.alertAudio.load();
      this.isAudioUnlocked = true;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['alerts'] && this.alerts && this.alerts.length > 0) {
      const latestAlert = this.alerts[0];
      if (latestAlert.severity === 'CRITICAL') {
        this.playCriticalAlert();
      }
    }
  }

  toggleMute(event: Event) {
    event.stopPropagation();
    this.isMuted = !this.isMuted;
  }

  playCriticalAlert(): void {
    if (this.isAudioUnlocked && !this.isMuted && this.alertAudio) {
      this.alertAudio.play().catch(err => console.warn('Audio blocked:', err));
    }
  }

  getAlertStyles(severity: string) {
    if (severity === 'CRITICAL') return { icon: this.AlertCircleIcon, color: 'text-rose-600', bg: 'bg-rose-100', border: 'border-rose-200' };
    if (severity === 'WARNING') return { icon: this.AlertTriangleIcon, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' };
    return { icon: this.CheckCircleIcon, color: 'text-teal-600', bg: 'bg-teal-100', border: 'border-teal-200' };
  }

  getStatusStyles(status: string) {
    if (status === 'ACTIVE') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (status === 'DISPATCHED') return 'bg-sky-50 text-sky-700 border-sky-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200'; // RESOLVED
  }
}
