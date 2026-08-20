import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CameraScreeningPanelComponent } from '../../../../components/camera-screening-panel/camera-screening-panel.component';

@Component({
  selector: 'app-camera-screening-view',
  standalone: true,
  imports: [CommonModule, CameraScreeningPanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            Optical Diagnostics
          </h2>
          <p class="text-xs text-slate-400 mt-1">Real-time particulate analysis via Edge Camera</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <app-camera-screening-panel></app-camera-screening-panel>
        
        <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-center items-center h-full min-h-[300px]">
          <div class="text-slate-400 text-sm mb-4">Particle Size Distribution</div>
          <div class="w-full flex items-end h-40 gap-2 px-8">
            <div class="flex-1 bg-cyan-500/80 rounded-t-sm relative group" style="height: 80%">
              <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">80%</div>
            </div>
            <div class="flex-1 bg-amber-500/80 rounded-t-sm relative group" style="height: 15%">
               <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">15%</div>
            </div>
            <div class="flex-1 bg-rose-500/80 rounded-t-sm relative group" style="height: 5%">
               <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">5%</div>
            </div>
          </div>
          <div class="w-full flex justify-between px-8 mt-2 text-[10px] text-slate-500 font-medium">
            <div class="text-center w-1/3">Fine<br/>(<0.5mm)</div>
            <div class="text-center w-1/3">Medium<br/>(0.5-1.2mm)</div>
            <div class="text-center w-1/3">Coarse<br/>(>1.2mm)</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CameraScreeningViewComponent {}
