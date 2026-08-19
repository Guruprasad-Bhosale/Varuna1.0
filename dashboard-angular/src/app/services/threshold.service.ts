import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export const DEFAULT_CPCB_THRESHOLDS: any = {
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
  
  private thresholdsSubject = new BehaviorSubject<any>(this.loadThresholds());
  public thresholds$ = this.thresholdsSubject.asObservable();

  private isModalOpenSubject = new BehaviorSubject<boolean>(false);
  public isModalOpen$ = this.isModalOpenSubject.asObservable();

  constructor() {}

  private loadThresholds() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_CPCB_THRESHOLDS;
    } catch {
      return DEFAULT_CPCB_THRESHOLDS;
    }
  }

  updateThresholds(newThresholds: any) {
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

  evaluateParameterHealth(paramKey: string, value: number | null | undefined, currentThresholds: any) {
    if (value === undefined || value === null) {
      return {
        status: 'safe',
        label: 'NO DATA',
        cardClass: 'border-slate-800 bg-slate-900/50',
        badgeClass: 'border-slate-700 bg-slate-800 text-slate-400',
        barColor: 'bg-slate-700',
        barGlow: ''
      };
    }

    const th = currentThresholds[paramKey] || DEFAULT_CPCB_THRESHOLDS[paramKey];
    let status = 'safe';

    if (paramKey === 'ph') {
      if (value >= th.safeMin && value <= th.safeMax) {
        status = 'safe';
      } else if (value >= th.warnMin && value <= th.warnMax) {
        status = 'moderate';
      } else {
        status = 'dangerous';
      }
    } else {
      if (value <= th.safeMax) {
        status = 'safe';
      } else if (value <= th.warnMax) {
        status = 'moderate';
      } else {
        status = 'dangerous';
      }
    }

    const styles: any = {
      safe: {
        status: 'safe',
        label: 'NOMINAL',
        cardClass: 'border-emerald-500/20 bg-emerald-950/10',
        badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
        barColor: 'bg-emerald-400',
        barGlow: 'shadow-[0_0_10px_rgba(52,211,153,0.5)]'
      },
      moderate: {
        status: 'moderate',
        label: 'WARNING',
        cardClass: 'border-amber-500/20 bg-amber-950/10',
        badgeClass: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
        barColor: 'bg-amber-400',
        barGlow: 'shadow-[0_0_10px_rgba(251,191,36,0.5)]'
      },
      dangerous: {
        status: 'dangerous',
        label: 'CRITICAL',
        cardClass: 'border-rose-500/30 bg-rose-950/20',
        badgeClass: 'animate-pulse border-rose-500/40 bg-rose-500/10 text-rose-400',
        barColor: 'bg-rose-500',
        barGlow: 'shadow-[0_0_12px_rgba(244,63,94,0.7)]'
      }
    };

    return styles[status];
  }
}
