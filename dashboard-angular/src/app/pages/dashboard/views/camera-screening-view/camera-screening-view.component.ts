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
          <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1.5">
            <span class="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse"></span>
            Edge Optical Flow Active
          </span>
        </div>
        <p class="text-xs text-slate-500 font-medium">
          Real-time suspended particulate morphological analysis & microplastic screening via Raspberry Pi Optical Flow Unit
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <app-camera-screening-panel></app-camera-screening-panel>
        
        <div class="stamp-card p-6 flex flex-col justify-between h-full min-h-[300px] relative">
          <div class="absolute -top-3 right-4 highlighter-teal px-2 py-0.5 text-[10px] font-black uppercase text-teal-900 border border-teal-200 transform rotate-2">Morphological Ledger</div>
          <div>
            <h3 class="text-base font-extrabold text-slate-900 uppercase underline decoration-slate-300 decoration-2 underline-offset-4">Particle Size Distribution</h3>
          </div>

          <!-- Chart Area -->
          <div class="flex-1 flex flex-col justify-end pt-8 pb-2 relative mt-4">
            <!-- Grid Lines -->
            <div class="absolute inset-x-0 bottom-6 border-b border-dashed border-slate-300"></div>
            <div class="absolute inset-x-0 bottom-16 border-b border-dashed border-slate-300"></div>
            <div class="absolute inset-x-0 bottom-24 border-b border-dashed border-slate-300"></div>
            
            <div class="w-full flex items-end h-48 gap-4 px-4 relative z-10">
              <!-- Fine Bin -->
              <div class="flex-1 rounded-t border-2 border-slate-900 border-b-0 shadow-[2px_0px_0px_0px_#0f172a] relative group cursor-pointer" 
                   style="background: repeating-linear-gradient(45deg, #14b8a6, #14b8a6 4px, #0d9488 4px, #0d9488 8px);" [style.height.%]="finePct ?? 68">
                <div class="absolute -top-6 left-1/2 -translate-x-1/2 font-mono font-bold text-slate-900 whitespace-nowrap text-[11px] bg-white/80 px-1">&#123; 68% &#125;</div>
              </div>
              <!-- Medium Bin -->
              <div class="flex-1 rounded-t border-2 border-slate-900 border-b-0 shadow-[2px_0px_0px_0px_#0f172a] relative group cursor-pointer" 
                   style="background: repeating-linear-gradient(45deg, #f59e0b, #f59e0b 4px, #d97706 4px, #d97706 8px);" [style.height.%]="mediumPct ?? 24">
                 <div class="absolute -top-6 left-1/2 -translate-x-1/2 font-mono font-bold text-slate-900 whitespace-nowrap text-[11px] bg-white/80 px-1">&#123; 24% &#125;</div>
              </div>
              <!-- Coarse Bin -->
              <div class="flex-1 rounded-t border-2 border-slate-900 border-b-0 shadow-[2px_0px_0px_0px_#0f172a] relative group cursor-pointer" 
                   style="background: repeating-linear-gradient(45deg, #f43f5e, #f43f5e 4px, #e11d48 4px, #e11d48 8px);" [style.height.%]="coarsePct ?? 8">
                 <div class="absolute -top-6 left-1/2 -translate-x-1/2 font-mono font-bold text-slate-900 whitespace-nowrap text-[11px] bg-white/80 px-1">&#123; 8% &#125;</div>
              </div>
            </div>
            
            <!-- Axis Labels -->
            <div class="w-full flex justify-between px-4 mt-3 text-[11px] text-slate-900 font-bold border-t-2 border-slate-900 pt-2 font-mono uppercase">
              <div class="text-center w-1/3">Fine<br/><span class="text-[9px] text-slate-500 font-bold">(&lt;0.5mm)</span></div>
              <div class="text-center w-1/3">Medium<br/><span class="text-[9px] text-slate-500 font-bold">(0.5-1.2mm)</span></div>
              <div class="text-center w-1/3">Coarse<br/><span class="text-[9px] text-slate-500 font-bold">(&gt;1.2mm)</span></div>
            </div>
          </div>

          <!-- Bottom Metric Summary Cards -->
          <div class="grid grid-cols-3 gap-3 pt-4 border-t-2 border-slate-300 border-dashed">
            <div class="bg-white rounded p-3 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a]">
              <div class="text-[9px] text-slate-500 font-black uppercase tracking-wider mb-1">Turbidity Correl.</div>
              <div class="text-sm font-black font-mono text-slate-900">4.80 NTU</div>
              <div class="text-[9px] font-black uppercase text-emerald-600 mt-0.5 highlighter-teal inline-block">Aligned</div>
            </div>
            <div class="bg-white rounded p-3 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a]">
              <div class="text-[9px] text-slate-500 font-black uppercase tracking-wider mb-1">Microplastic Idx</div>
              <div class="text-sm font-black font-mono text-slate-900">Tier 1</div>
              <div class="text-[9px] font-black uppercase text-emerald-600 mt-0.5 highlighter-teal inline-block">Low Risk</div>
            </div>
            <div class="bg-white rounded p-3 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a]">
              <div class="text-[9px] text-slate-500 font-black uppercase tracking-wider mb-1">Optical Clarity</div>
              <div class="text-sm font-black font-mono text-slate-900">94.2%</div>
              <div class="text-[9px] font-black uppercase text-teal-600 mt-0.5 highlighter-teal inline-block">High</div>
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
