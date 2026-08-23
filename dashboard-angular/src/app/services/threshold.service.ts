import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface MetricThreshold {
  safeMin?: number;
  safeMax: number;
  warnMin?: number;
  warnMax: number;
}

export type ThresholdConfig = Record<string, MetricThreshold>;

export const DEFAULT_CPCB_THRESHOLDS: ThresholdConfig = {
  ph: { safeMin: 6.5, safeMax: 8.5, warnMin: 6.0, warnMax: 9.0 },
  turbidity_ntu: { safeMax: 10, warnMax: 30 },
  ec_us_cm: { safeMax: 600, warnMax: 1200 },
  temperature_c: { safeMax: 28.0, warnMax: 32.0 },
  particle_count: { safeMax: 100, warnMax: 300 },
  avg_particle_size_mm: { safeMax: 0.60, warnMax: 1.20 }
};

@Injectable({
  providedIn: 'root'
})
export class ThresholdService {
  private readonly STORAGE_KEY = 'varuna_custom_thresholds_v1';
  
  private thresholdsSubject = new BehaviorSubject<ThresholdConfig>(this.loadThresholds());
  public thresholds$ = this.thresholdsSubject.asObservable();

  private isModalOpenSubject = new BehaviorSubject<boolean>(false);
  public isModalOpen$ = this.isModalOpenSubject.asObservable();

  constructor() {}

  private loadThresholds(): ThresholdConfig {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_CPCB_THRESHOLDS;
    } catch {
      return DEFAULT_CPCB_THRESHOLDS;
    }
  }

  updateThresholds(newThresholds: ThresholdConfig) {
    this.thresholdsSubject.next(newThresholds);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newThresholds));
  }

  resetThresholds() {
    this.thresholdsSubject.next(DEFAULT_CPCB_THRESHOLDS);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  setModalOpen(isOpen: boolean) {
    this.isModalOpenSubject.next(isOpen);
  }

  evaluateParameterHealth(paramKey: string, value: number | null | undefined, currentThresholds: ThresholdConfig) {
    if (value === undefined || value === null) {
      return {
        status: 'safe',
        label: 'NO DATA',
        cardClass: 'border-slate-200 bg-white',
        badgeClass: 'border-slate-200 bg-slate-100 text-slate-600',
        barColor: 'bg-slate-300',
        barGlow: ''
      };
    }

    const th = currentThresholds[paramKey] || DEFAULT_CPCB_THRESHOLDS[paramKey];
    let status: 'safe' | 'moderate' | 'dangerous' = 'safe';

    if (paramKey === 'ph') {
      if (value < (th.warnMin ?? 0) || value > th.warnMax) {
        status = 'dangerous';
      } else if (value < (th.safeMin ?? 0) || value > th.safeMax) {
        status = 'moderate';
      } else {
        status = 'safe';
      }
    } else {
      if (value > th.warnMax) {
        status = 'dangerous';
      } else if (value > th.safeMax) {
        status = 'moderate';
      } else {
        status = 'safe';
      }
    }

    const styles: Record<string, { status: string; label: string; cardClass: string; badgeClass: string; barColor: string; barGlow: string }> = {
      safe: {
        status: 'safe',
        label: 'NOMINAL',
        cardClass: 'border-emerald-200 bg-emerald-50/50',
        badgeClass: 'border-emerald-200 bg-emerald-100 text-emerald-700',
        barColor: 'bg-emerald-500',
        barGlow: 'shadow-[0_0_10px_rgba(52,211,153,0.3)]'
      },
      moderate: {
        status: 'moderate',
        label: 'WARNING',
        cardClass: 'border-amber-200 bg-amber-50/50',
        badgeClass: 'border-amber-200 bg-amber-100 text-amber-700',
        barColor: 'bg-amber-500',
        barGlow: 'shadow-[0_0_10px_rgba(251,191,36,0.3)]'
      },
      dangerous: {
        status: 'dangerous',
        label: 'CRITICAL',
        cardClass: 'border-rose-200 bg-rose-50/50',
        badgeClass: 'animate-pulse border-rose-200 bg-rose-100 text-rose-700',
        barColor: 'bg-rose-500',
        barGlow: 'shadow-[0_0_12px_rgba(244,63,94,0.4)]'
      }
    };

    return styles[status];
  }
}
