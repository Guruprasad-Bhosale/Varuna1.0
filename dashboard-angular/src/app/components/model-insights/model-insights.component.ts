import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Brain, ArrowUpRight, TrendingUp, TrendingDown, Minus } from 'lucide-angular';

@Component({
  selector: 'app-model-insights',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './model-insights.component.html',
  styleUrls: ['./model-insights.component.css']
})
export class ModelInsightsComponent {
  @Input() latestData: any;

  readonly BrainIcon = Brain;
  readonly ArrowUpRightIcon = ArrowUpRight;
  readonly TrendingUpIcon = TrendingUp;
  readonly TrendingDownIcon = TrendingDown;
  readonly MinusIcon = Minus;

  get confidence() {
    return this.latestData?.confidence_pct || 0;
  }
}
