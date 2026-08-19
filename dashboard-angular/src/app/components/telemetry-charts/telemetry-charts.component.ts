import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'app-telemetry-charts',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEchartsModule],
  templateUrl: './telemetry-charts.component.html',
  styleUrls: ['./telemetry-charts.component.css']
})
export class TelemetryChartsComponent implements OnChanges {
  @Input() historyData: any[] = [];

  metric = 'safety_score';
  timeRange = '24h';
  chartOptions: EChartsOption = {};

  config: any = {
    safety_score: { name: 'Safety Score', color: '#16a34a', domain: [0, 100] },
    ph: { name: 'pH Level', color: '#0d9488', domain: [0, 14], dangerLow: 6.5, dangerHigh: 8.5 },
    turbidity_ntu: { name: 'Turbidity (NTU)', color: '#d97706', domain: [0, 50], dangerHigh: 10 },
    ec_us_cm: { name: 'EC (µS/cm)', color: '#0ea5e9', domain: [0, 1000], dangerHigh: 600 }
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['historyData'] && this.historyData.length > 0) {
      this.updateChart();
    }
  }

  onMetricChange(newMetric: string) {
    this.metric = newMetric;
    this.updateChart();
  }

  onTimeRangeChange(newTimeRange: string) {
    this.timeRange = newTimeRange;
    this.updateChart();
  }

  private updateChart() {
    if (!this.historyData || this.historyData.length === 0) return;

    const activeConf = this.config[this.metric];
    
    // Sort chronological
    const sortedData = [...this.historyData].reverse();
    
    const times = sortedData.map(d => {
      const date = new Date(d.timestamp);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    });
    
    const values = sortedData.map(d => d[this.metric]);

    const markAreas = [];
    if (this.metric === 'safety_score') {
      markAreas.push(
        { itemStyle: { color: 'rgba(220, 252, 231, 0.4)' }, yAxis: 75 },
        { itemStyle: { color: 'rgba(254, 243, 199, 0.4)' }, yAxis: 45 },
        { itemStyle: { color: 'rgba(254, 226, 226, 0.4)' }, yAxis: 0 }
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
      grid: { top: 10, right: 10, bottom: 20, left: 30 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        textStyle: { color: '#0f172a', fontSize: 13, fontWeight: 600 }
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
            data: this.metric === 'safety_score' ? [
              [{ yAxis: 75, itemStyle: { color: 'rgba(220, 252, 231, 0.4)' } }, { yAxis: 100 }],
              [{ yAxis: 45, itemStyle: { color: 'rgba(254, 243, 199, 0.4)' } }, { yAxis: 75 }],
              [{ yAxis: 0, itemStyle: { color: 'rgba(254, 226, 226, 0.4)' } }, { yAxis: 45 }]
            ] : markAreas
          } : undefined
        }
      ]
    };
  }
}
