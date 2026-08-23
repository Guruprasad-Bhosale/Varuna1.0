import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThresholdConfigModalComponent } from '../../../../components/threshold-config-modal/threshold-config-modal.component';
import { WhatsappModalComponent } from '../../../../components/whatsapp-modal/whatsapp-modal.component';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-settings-view',
  standalone: true,
  imports: [CommonModule, ThresholdConfigModalComponent, WhatsappModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            System Settings & Calibration
          </h2>
          <p class="text-xs text-slate-600 mt-1 font-medium">Configure thresholds, hardware parameters, and notification gateways</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Parameter Thresholds Panel -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div class="mb-4 pb-2 border-b border-slate-100 text-sm font-bold text-slate-900">Parameter Thresholds</div>
          <div class="relative w-full h-full">
             <app-threshold-config-modal></app-threshold-config-modal>
          </div>
        </div>

        <!-- WhatsApp Gateway Panel -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
           <div class="mb-4 pb-2 border-b border-slate-100 text-sm font-bold text-slate-900">WhatsApp Gateway</div>
           <div class="relative w-full h-full">
             <app-whatsapp-modal></app-whatsapp-modal>
           </div>
        </div>

        <!-- Edge Hardware Config Panel -->
        <div class="stamp-card p-6 bg-white space-y-4">
           <div class="mb-4 pb-2 border-b border-slate-200 text-sm font-black text-slate-900 uppercase tracking-tight">Edge Hardware Config</div>
           <div class="space-y-4">
             <div>
               <label class="text-xs uppercase font-black text-slate-800 block mb-2">Sampling Interval (5m - 60m)</label>
               <input type="range" min="5" max="60" value="15" class="w-full accent-teal-600 cursor-pointer" />
               <div class="text-right text-xs font-mono font-bold text-teal-700 mt-1">15 min</div>
             </div>
             
             <div class="pt-4 border-t border-slate-200 space-y-4">
                <input type="text" placeholder="Station Name" value="JalDrishti-001 (Sarjekot Outfall)" class="w-full bg-slate-50 border-2 border-slate-900 rounded-xl text-slate-900 px-4 py-2.5 font-bold font-mono outline-none focus:ring-2 focus:ring-teal-500 transition-colors shadow-[2px_2px_0px_0px_#0f172a]" />
                <div class="flex gap-4">
                  <input type="text" placeholder="Lat" value="16.2699" class="w-1/2 bg-slate-50 border-2 border-slate-900 rounded-xl text-slate-900 px-4 py-2.5 font-bold font-mono outline-none focus:ring-2 focus:ring-teal-500 transition-colors shadow-[2px_2px_0px_0px_#0f172a]" />
                  <input type="text" placeholder="Lng" value="73.7148" class="w-1/2 bg-slate-50 border-2 border-slate-900 rounded-xl text-slate-900 px-4 py-2.5 font-bold font-mono outline-none focus:ring-2 focus:ring-teal-500 transition-colors shadow-[2px_2px_0px_0px_#0f172a]" />
                </div>
                <button (click)="clearCache()" class="stamp-btn bg-slate-900 hover:bg-rose-700 text-white font-black text-xs px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 w-full mt-4 border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a]">
                  Clear Offline Cache
                </button>
             </div>
           </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsViewComponent {
  constructor(private toast: ToastService) {}

  clearCache() {
    localStorage.clear();
    // Assuming indexedDB/PWA cache clear is required or simulated
    if ('caches' in window) {
      caches.keys().then(names => {
        for (let name of names) caches.delete(name);
      });
    }
    this.toast.show("Offline telemetry cache purged", "info");
  }
}
