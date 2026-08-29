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
      <div class="mb-6 space-y-1">
        <div class="flex items-center gap-2">
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Optical Diagnostics</h2>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1.5">
            <span class="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse"></span>
            Edge Optical Flow Active
          </span>
        </div>
        <p class="text-xs text-slate-600 font-medium">
          Real-time suspended particulate morphological analysis & microplastic screening via Raspberry Pi Optical Flow Unit
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <app-camera-screening-panel></app-camera-screening-panel>
        
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-full min-h-[300px]">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-base font-bold text-slate-900">Particle Size Distribution</h3>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Morphological Ledger</span>
          </div>

          <!-- Chart Area -->
          <div class="flex-1 flex flex-col justify-end pt-8 pb-2 relative mt-4">
            <!-- Grid Lines -->
            <div class="absolute inset-x-0 bottom-6 border-b border-slate-100"></div>
            <div class="absolute inset-x-0 bottom-16 border-b border-slate-100"></div>
            <div class="absolute inset-x-0 bottom-24 border-b border-slate-100"></div>
            
            <div class="w-full flex items-end h-48 gap-4 px-4 relative z-10">
              <!-- Fine Bin -->
              <div class="flex-1 rounded-t-lg bg-teal-500 hover:bg-teal-600 relative group cursor-pointer transition-colors shadow-sm" [style.height.%]="finePct ?? 68">
                <div class="absolute -top-6 left-1/2 -translate-x-1/2 font-mono font-bold text-slate-900 whitespace-nowrap text-xs bg-white/90 px-1.5 py-0.5 rounded shadow-sm">{{ finePct ?? 68 }}%</div>
              </div>
              <!-- Medium Bin -->
              <div class="flex-1 rounded-t-lg bg-amber-500 hover:bg-amber-600 relative group cursor-pointer transition-colors shadow-sm" [style.height.%]="mediumPct ?? 24">
                 <div class="absolute -top-6 left-1/2 -translate-x-1/2 font-mono font-bold text-slate-900 whitespace-nowrap text-xs bg-white/90 px-1.5 py-0.5 rounded shadow-sm">{{ mediumPct ?? 24 }}%</div>
              </div>
              <!-- Coarse Bin -->
              <div class="flex-1 rounded-t-lg bg-rose-500 hover:bg-rose-600 relative group cursor-pointer transition-colors shadow-sm" [style.height.%]="coarsePct ?? 8">
                 <div class="absolute -top-6 left-1/2 -translate-x-1/2 font-mono font-bold text-slate-900 whitespace-nowrap text-xs bg-white/90 px-1.5 py-0.5 rounded shadow-sm">{{ coarsePct ?? 8 }}%</div>
              </div>
            </div>
            
            <!-- Axis Labels -->
            <div class="w-full flex justify-between px-4 mt-3 text-xs text-slate-800 font-bold border-t border-slate-200 pt-2 font-mono">
              <div class="text-center w-1/3">Fine<br/><span class="text-[10px] text-slate-500 font-semibold">(&lt;0.5mm)</span></div>
              <div class="text-center w-1/3">Medium<br/><span class="text-[10px] text-slate-500 font-semibold">(0.5-1.2mm)</span></div>
              <div class="text-center w-1/3">Coarse<br/><span class="text-[10px] text-slate-500 font-semibold">(&gt;1.2mm)</span></div>
            </div>
          </div>

          <!-- Bottom Metric Summary Cards -->
          <div class="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
            <div class="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <div class="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Turbidity Correl.</div>
              <div class="text-sm font-black font-mono text-slate-900">4.80 NTU</div>
              <div class="text-[10px] font-bold text-emerald-700 mt-0.5">Aligned</div>
            </div>
            <div class="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <div class="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Microplastic Idx</div>
              <div class="text-sm font-black font-mono text-slate-900">Tier 1</div>
              <div class="text-[10px] font-bold text-emerald-700 mt-0.5">Low Risk</div>
            </div>
            <div class="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <div class="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Optical Clarity</div>
              <div class="text-sm font-black font-mono text-slate-900">94.2%</div>
              <div class="text-[10px] font-bold text-teal-700 mt-0.5">High</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CameraScreeningViewComponent {
  finePct?: number = 68;
  mediumPct?: number = 24;
  coarsePct?: number = 8;
}

