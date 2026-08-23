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
          <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
            System Settings & Calibration
          </h2>
          <p class="text-xs text-slate-500 mt-1">Configure thresholds, hardware parameters, and notification gateways</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Settings panels that were previously modals -->
        <div class="stamp-card p-6 space-y-4 overflow-hidden relative bg-white">
          <div class="mb-4 pb-2 border-b-2 border-slate-900 border-dashed text-sm font-black text-slate-900 uppercase">Parameter Thresholds</div>
          <div class="relative w-full h-full transform scale-95 origin-top">
             <app-threshold-config-modal></app-threshold-config-modal>
          </div>
        </div>

        <div class="stamp-card p-6 space-y-4 bg-white relative">
           <div class="mb-4 pb-2 border-b-2 border-slate-900 border-dashed text-sm font-black text-slate-900 uppercase">WhatsApp Gateway</div>
           <div class="relative w-full h-full transform scale-95 origin-top">
             <app-whatsapp-modal></app-whatsapp-modal>
           </div>
        </div>

        <div class="stamp-card p-6 space-y-4 bg-white relative">
           <div class="mb-4 pb-2 border-b-2 border-slate-900 border-dashed text-sm font-black text-slate-900 uppercase">Edge Hardware Config</div>
           <div class="space-y-4">
             <div>
               <label class="text-[10px] uppercase font-black text-slate-500 block mb-2">Sampling Interval (5m - 60m)</label>
               <input type="range" min="5" max="60" value="15" class="w-full accent-teal-600" />
               <div class="text-right text-xs font-mono font-bold text-teal-700 mt-1">15 min</div>
             </div>
             
             <div class="pt-4 border-t-2 border-slate-200 border-dashed space-y-4">
                <input type="text" placeholder="Station Name" value="VARUNA-001 (Panchaganga)" class="w-full bg-transparent border-0 border-b-2 border-slate-300 text-slate-900 px-0 py-2.5 font-bold font-mono outline-none focus:ring-0 focus:border-slate-900 transition-colors" />
                <div class="flex gap-4">
                  <input type="text" placeholder="Lat" value="16.7050" class="w-1/2 bg-transparent border-0 border-b-2 border-slate-300 text-slate-900 px-0 py-2.5 font-bold font-mono outline-none focus:ring-0 focus:border-slate-900 transition-colors" />
                  <input type="text" placeholder="Lng" value="74.2430" class="w-1/2 bg-transparent border-0 border-b-2 border-slate-300 text-slate-900 px-0 py-2.5 font-bold font-mono outline-none focus:ring-0 focus:border-slate-900 transition-colors" />
                </div>
                <button (click)="clearCache()" class="stamp-btn bg-slate-900 text-white font-black uppercase text-xs px-4 py-3 transition-colors flex items-center justify-center gap-2 w-full mt-4 hover:bg-rose-700">
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
