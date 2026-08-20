import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThresholdConfigModalComponent } from '../../../../components/threshold-config-modal/threshold-config-modal.component';
import { WhatsappModalComponent } from '../../../../components/whatsapp-modal/whatsapp-modal.component';

@Component({
  selector: 'app-settings-view',
  standalone: true,
  imports: [CommonModule, ThresholdConfigModalComponent, WhatsappModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            System Settings & Calibration
          </h2>
          <p class="text-xs text-slate-400 mt-1">Configure thresholds, hardware parameters, and notification gateways</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Settings panels that were previously modals -->
        <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-hidden relative">
          <div class="mb-4 pb-2 border-b border-slate-800 text-sm font-semibold text-slate-300">Parameter Thresholds</div>
          <!-- Injecting modal component directly -->
          <div class="relative w-full h-full transform scale-95 origin-top">
             <app-threshold-config-modal></app-threshold-config-modal>
          </div>
        </div>

        <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
           <div class="mb-4 pb-2 border-b border-slate-800 text-sm font-semibold text-slate-300">WhatsApp Gateway</div>
           <div class="relative w-full h-full transform scale-95 origin-top">
             <app-whatsapp-modal></app-whatsapp-modal>
           </div>
        </div>

        <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
           <div class="mb-4 pb-2 border-b border-slate-800 text-sm font-semibold text-slate-300">Edge Hardware Config</div>
           <div class="space-y-4">
             <div>
               <label class="text-xs text-slate-400 block mb-2">Sampling Interval (5m - 60m)</label>
               <input type="range" min="5" max="60" value="15" class="w-full accent-cyan-500" />
               <div class="text-right text-xs font-mono text-cyan-400 mt-1">15 min</div>
             </div>
             
             <div class="pt-4 border-t border-slate-800 space-y-3">
                <input type="text" placeholder="Station Name" value="VARUNA-001 (Panchaganga)" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-300" />
                <div class="flex gap-2">
                  <input type="text" placeholder="Lat" value="16.7050" class="w-1/2 bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-300" />
                  <input type="text" placeholder="Lng" value="74.2430" class="w-1/2 bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-300" />
                </div>
                <button class="w-full py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-xs font-medium transition-all">Clear Offline SQLite Cache</button>
             </div>
           </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsViewComponent {}
