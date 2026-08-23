import { Component, Input, OnChanges, SimpleChanges, OnInit, OnDestroy, inject, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { downsampleLTTB } from '../../core/utils/downsample';
import { TelemetryService } from '../../services/telemetry.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-telemetry-charts',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEchartsModule],
  templateUrl: './telemetry-charts.component.html',
  styleUrls: ['./telemetry-charts.component.css']
})
export class TelemetryChartsComponent implements OnChanges, OnInit, OnDestroy, AfterViewInit {
  @Input() historyData: any[] = [];
  @Input() metric = 'safety_score';
  
  private telemetryService = inject(TelemetryService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  private sub?: Subscription;
  private currentStreamData: any[] = [];
  private resizeObserver?: ResizeObserver;
  private chartInstance: any;

  @ViewChild('chartContainer') chartContainer!: ElementRef;

  timeRange = '24h';
  chartOptions: EChartsOption = {};

  config: any = {
    safety_score: { name: 'Safety Score', color: '#16a34a', domain: [0, 100] },
    ph: { name: 'pH Level', color: '#0d9488', domain: [0, 14], dangerLow: 6.5, dangerHigh: 8.5 },
    turbidity_ntu: { name: 'Turbidity (NTU)', color: '#d97706', domain: [0, 50], dangerHigh: 10 },
    ec_us_cm: { name: 'EC (µS/cm)', color: '#0ea5e9', domain: [0, 1000], dangerHigh: 600 }
  };

  ngOnInit() {
    this.sub = this.telemetryService.telemetry$.subscribe((data) => {
      if (!data) return;
      if (this.currentStreamData.length === 0) return; // Wait for initial history

      // Parse timestamp robustly since live stream might send localized time strings
      let timeMs = new Date(data.timestamp).getTime();
      if (isNaN(timeMs)) {
        timeMs = Date.now();
      }

      // Append new live data and slide window
      const liveData = { ...data, timestamp: new Date(timeMs).toISOString() };
      this.currentStreamData.push(liveData);
      const maxPoints = this.timeRange === '1H' ? 50 : 150;
      if (this.currentStreamData.length > maxPoints) {
        this.currentStreamData.shift();
      }
      this.refreshChart(this.currentStreamData);
    });
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      let resizeTimeout: any;
      this.resizeObserver = new ResizeObserver(() => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          this.chartInstance?.resize({ animation: { duration: 150 } });
        }, 100);
      });

      if (this.chartContainer?.nativeElement) {
        this.resizeObserver.observe(this.chartContainer.nativeElement);
      }
    });
  }

  onChartInit(ec: any) {
    this.chartInstance = ec;
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.resizeObserver?.disconnect();
    this.chartInstance?.dispose();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['historyData'] && this.historyData.length > 0) {
      // Sort chronologically (oldest to newest)
      this.currentStreamData = [...this.historyData].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      this.refreshChart(this.currentStreamData);
    } else if (changes['metric']) {
      this.refreshChart(this.currentStreamData);
    }
  }

  onMetricChange(newMetric: string) {
    this.metric = newMetric;
    this.refreshChart(this.currentStreamData);
  }

  onTimeRangeChange(newTimeRange: string) {
    this.timeRange = newTimeRange;
    this.refreshChart(this.currentStreamData);
  }

  private refreshChart(dataToRender: any[]) {
    if (!dataToRender || dataToRender.length === 0) return;

    const activeConf = this.config[this.metric];
    
    // Decimate max points using LTTB if needed, though stream might be short
    const tuples: [number, number][] = dataToRender.map(d => [new Date(d.timestamp).getTime(), d[this.metric]]);
    const sampledTuples = downsampleLTTB(tuples, 150);

    const times = sampledTuples.map(t => {
      const date = new Date(t[0]);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    });
    
    const values = sampledTuples.map(t => t[1]);

    const markAreas: any[] = [];
    if (this.metric === 'safety_score') {
      markAreas.push(
        [{ yAxis: 75, itemStyle: { color: 'rgba(220, 252, 231, 0.4)' } }, { yAxis: 100 }],
        [{ yAxis: 45, itemStyle: { color: 'rgba(254, 243, 199, 0.4)' } }, { yAxis: 75 }],
        [{ yAxis: 0, itemStyle: { color: 'rgba(254, 226, 226, 0.4)' } }, { yAxis: 45 }]
      );
    } else {
      if (activeConf.dangerHigh) {
        markAreas.push([{ yAxis: activeConf.dangerHigh, itemStyle: { color: 'rgba(254, 226, 226, 0.5)' } }, { yAxis: activeConf.domain[1] }]);
      }
      if (activeConf.dangerLow) {
        markAreas.push([{ yAxis: activeConf.domain[0], itemStyle: { color: 'rgba(254, 226, 226, 0.5)' } }, { yAxis: activeConf.dangerLow }]);
      }
    }

    this.chartOptions = {
      backgroundColor: 'transparent',
      grid: { 
        show: true,
        borderColor: '#e2e8f0',
        borderWidth: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        top: 10, 
        right: 10, 
        bottom: 20, 
        left: 30 
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: { color: '#0f172a', fontSize: 12, fontWeight: 600 },
        formatter: (params: any) => {
          const item = Array.isArray(params) ? params[0] : params;
          const val = typeof item.value === 'number' ? item.value.toFixed(1) : Number(item.value[1]).toFixed(1);
          return `
            <div style="padding: 2px 4px;">
              <div style="font-size: 11px; color: #64748b; font-weight: 500; margin-bottom: 2px;">${item.name || item.axisValue}</div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #0d9488;"></span>
                <span style="font-weight: 700; color: #0f172a;">${item.seriesName}:</span>
                <span style="font-family: monospace; font-weight: 800; color: #0d9488;">${val}%</span>
              </div>
            </div>
          `;
        }
      },
      xAxis: {
        type: 'category',
        data: times,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#94a3b8', fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        min: activeConf.domain[0],
        max: activeConf.domain[1],
        splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
        axisLabel: { color: '#94a3b8', fontSize: 11 }
      },
      series: [
        {
          name: activeConf.name,
          type: 'line',
          data: values,
          smooth: true,
          showSymbol: false,
          sampling: 'lttb',
          animation: false,
          itemStyle: { color: activeConf.color },
          areaStyle: this.metric === 'safety_score' ? {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: activeConf.color },
                { offset: 1, color: 'transparent' }
              ]
            },
            opacity: 0.2
          } : undefined,
          markArea: markAreas.length > 0 ? {
            silent: true,
            data: markAreas
          } : undefined
        }
      ]
    };
    
    this.cdr.markForCheck();
  }
}
