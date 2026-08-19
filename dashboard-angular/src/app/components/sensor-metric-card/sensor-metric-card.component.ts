import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Info, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-angular';
import { ThresholdService } from '../../services/threshold.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sensor-metric-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './sensor-metric-card.component.html',
  styleUrls: ['./sensor-metric-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SensorMetricCardComponent {
  @Input() config: any;
  @Input() value: number | null | undefined = null;

  private thresholdService = inject(ThresholdService);
  thresholds = toSignal(this.thresholdService.thresholds$);

  readonly InfoIcon = Info;
  readonly AlertCircleIcon = AlertCircle;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly AlertTriangleIcon = AlertTriangle;

  get health() {
    const t = this.thresholds();
    if (!t || !this.config || this.value === undefined || this.value === null) {
      return this.thresholdService.evaluateParameterHealth(this.config?.id, null, t);
    }
    return this.thresholdService.evaluateParameterHealth(this.config.id, this.value, t);
  }

  get progressPercent() {
    return Math.min(
      100,
      Math.max(8, ((this.value || 0) / (this.config?.maxScale || 100)) * 100)
    );
  }

  getIconForStatus(status: string) {
    if (status === 'safe') return this.CheckCircle2Icon;
    if (status === 'moderate') return this.AlertTriangleIcon;
    return this.AlertCircleIcon;
  }
}
