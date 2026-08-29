import { Component, input, computed, signal, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BloomPredictionData } from './bloom-prediction.types';

@Component({
  selector: 'app-bloom-prediction-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './bloom-prediction-card.component.html'
})
export class BloomPredictionCardComponent {
  data = input.required<BloomPredictionData>();
  showTooltip = signal<boolean>(false);

  // Dynamic Risk Tier Evaluation
  riskTier = computed(() => {
    const score = this.data().riskScore;
    if (score >= 80) {
      return {
        level: 'EXTREME',
        textColor: 'text-red-600',
        barColor: 'bg-red-600',
        badgeBg: 'bg-red-50',
        badgeBorder: 'border-red-600',
        badgeText: 'text-red-700',
        stampText: 'CRITICAL HAZARD DETECTED',
        summary: 'Conditions indicate extreme algal bloom risk',
        advice: '80–100 = EXTREME (Avoid Area)'
      };
    } else if (score >= 70) {
      return {
        level: 'HIGH RISK',
        textColor: 'text-rose-600',
        barColor: 'bg-rose-600',
        badgeBg: 'bg-rose-50',
        badgeBorder: 'border-rose-600',
        badgeText: 'text-rose-700',
        stampText: 'ELEVATED BLOOM DETECTED',
        summary: 'High nutrient & thermal stratification warning',
        advice: '70–79 = HIGH (Water Treatment Action)'
      };
    } else if (score >= 40) {
      return {
        level: 'MODERATE',
        textColor: 'text-amber-600',
        barColor: 'bg-amber-500',
        badgeBg: 'bg-amber-50',
        badgeBorder: 'border-amber-600',
        badgeText: 'text-amber-700',
        stampText: 'MONITORING ADVISORY',
        summary: 'Early biological proxy elevation observed',
        advice: '40–69 = MODERATE (Continuous Monitoring)'
      };
    }
    return {
      level: 'SAFE',
      textColor: 'text-emerald-700',
      barColor: 'bg-emerald-600',
      badgeBg: 'bg-emerald-50',
      badgeBorder: 'border-emerald-600',
      badgeText: 'text-emerald-800',
      stampText: 'APPROVED CPCB CLASS-A',
      summary: 'All parameters within nominal ecological thresholds',
      advice: '0–39 = SAFE (Optimal River Health)'
    };
  });

  toggleTooltip(): void {
    this.showTooltip.update(v => !v);
  }

  closeTooltip(): void {
    this.showTooltip.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showTooltip()) {
      this.closeTooltip();
    }
  }
}

