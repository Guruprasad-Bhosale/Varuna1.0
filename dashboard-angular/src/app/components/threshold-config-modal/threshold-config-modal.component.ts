import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, X, RotateCcw, Save, Sliders } from 'lucide-angular';
import { ThresholdService } from '../../services/threshold.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-threshold-config-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './threshold-config-modal.component.html',
  styleUrls: ['./threshold-config-modal.component.css']
})
export class ThresholdConfigModalComponent implements OnInit, OnDestroy {
  isOpen = false;
  thresholdForm!: FormGroup;
  
  private sub?: Subscription;
  private modalSub?: Subscription;

  readonly XIcon = X;
  readonly RotateCcwIcon = RotateCcw;
  readonly SaveIcon = Save;
  readonly SlidersIcon = Sliders;

  metrics = [
    { id: 'turbidity_ntu', label: 'Turbidity (NTU)', step: '1' },
    { id: 'ec_us_cm', label: 'Conductivity (µS/cm)', step: '10' },
    { id: 'temperature_c', label: 'Temperature (°C)', step: '0.5' },
    { id: 'particle_count', label: 'Optical Particulates', step: '5' },
    { id: 'avg_particle_size_mm', label: 'Avg Particle Size (mm)', step: '0.05' }
  ];

  constructor(
    private thresholdService: ThresholdService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.modalSub = this.thresholdService.isModalOpen$.subscribe(open => {
      this.isOpen = open;
    });

    this.sub = this.thresholdService.thresholds$.subscribe(t => {
      if (!this.thresholdForm) {
        this.initForm(t);
      } else {
        this.thresholdForm.patchValue(t, { emitEvent: false });
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.modalSub?.unsubscribe();
  }

  initForm(initial: any) {
    this.thresholdForm = this.fb.group({
      ph: this.fb.group({
        safeMin: [initial.ph?.safeMin || 0],
        safeMax: [initial.ph?.safeMax || 0],
        warnMin: [initial.ph?.warnMin || 0],
        warnMax: [initial.ph?.warnMax || 0]
      }),
      turbidity_ntu: this.createMetricGroup(initial.turbidity_ntu),
      ec_us_cm: this.createMetricGroup(initial.ec_us_cm),
      temperature_c: this.createMetricGroup(initial.temperature_c),
      particle_count: this.createMetricGroup(initial.particle_count),
      avg_particle_size_mm: this.createMetricGroup(initial.avg_particle_size_mm),
    });
  }

  createMetricGroup(val: any) {
    return this.fb.group({
      safeMax: [val?.safeMax || 0],
      warnMax: [val?.warnMax || 0]
    });
  }

  close() {
    this.thresholdService.setModalOpen(false);
  }

  handleSave() {
    if (this.thresholdForm.valid) {
      this.thresholdService.updateThresholds(this.thresholdForm.value);
      this.close();
    }
  }

  handleReset() {
    this.thresholdService.resetThresholds();
    this.close();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isOpen) {
      this.close();
    }
  }
}
