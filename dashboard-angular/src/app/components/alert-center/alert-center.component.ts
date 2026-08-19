import { Component, Input, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-angular';

@Component({
  selector: 'app-alert-center',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './alert-center.component.html',
  styleUrls: ['./alert-center.component.css']
})
export class AlertCenterComponent implements OnChanges {
  @Input() alerts: any[] = [];

  readonly AlertCircleIcon = AlertCircle;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly CheckCircleIcon = CheckCircle;

  private alertAudio = new Audio('assets/sounds/hazard_alarm.mp3');
  private isAudioUnlocked = false;
  public isMuted = false;

  // Unlock audio on the first user interaction anywhere on the document
  @HostListener('document:click')
  unlockAudio(): void {
    if (!this.isAudioUnlocked) {
      this.alertAudio.load();
      this.isAudioUnlocked = true;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['alerts'] && this.alerts && this.alerts.length > 0) {
      const latestAlert = this.alerts[0];
      if (latestAlert.predicted_safety_level === 'Dangerous') {
        this.playCriticalAlert();
      }
    }
  }

  toggleMute(event: Event) {
    event.stopPropagation();
    this.isMuted = !this.isMuted;
  }

  playCriticalAlert(): void {
    if (this.isAudioUnlocked && !this.isMuted) {
      this.alertAudio.play().catch(err => console.warn('Audio blocked:', err));
    }
  }

  getAlertStyles(level: string) {
    if (level === 'Dangerous') return { icon: this.AlertCircleIcon, color: 'text-dangerous', bg: 'bg-dangerousBg' };
    if (level === 'Moderate') return { icon: this.AlertTriangleIcon, color: 'text-moderate', bg: 'bg-moderateBg' };
    return { icon: this.CheckCircleIcon, color: 'text-safe', bg: 'bg-safeBg' };
  }

  getTriggerText(alert: any): string {
    if (alert.ph < 6.5 || alert.ph > 8.5) return `pH bounds exceeded (${alert.ph.toFixed(1)})`;
    if (alert.turbidity_ntu > 10) return `High turbidity (${alert.turbidity_ntu.toFixed(0)} NTU)`;
    if (alert.ec_us_cm > 600) return `High EC (${alert.ec_us_cm.toFixed(0)} µS/cm)`;
    return "Multiple anomalies";
  }
}
