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
        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 overflow-hidden relative">
          <div class="mb-4 pb-2 border-b border-slate-100 text-sm font-bold text-slate-900">Parameter Thresholds</div>
          <div class="relative w-full h-full transform scale-95 origin-top">
             <app-threshold-config-modal></app-threshold-config-modal>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
           <div class="mb-4 pb-2 border-b border-slate-100 text-sm font-bold text-slate-900">WhatsApp Gateway</div>
           <div class="relative w-full h-full transform scale-95 origin-top">
             <app-whatsapp-modal></app-whatsapp-modal>
           </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
           <div class="mb-4 pb-2 border-b border-slate-100 text-sm font-bold text-slate-900">Edge Hardware Config</div>
           <div class="space-y-4">
             <div>
               <label class="text-xs font-bold text-slate-500 block mb-2">Sampling Interval (5m - 60m)</label>
               <input type="range" min="5" max="60" value="15" class="w-full accent-teal-600" />
               <div class="text-right text-xs font-mono font-bold text-teal-700 mt-1">15 min</div>
             </div>
             
             <div class="pt-4 border-t border-slate-100 space-y-3">
                <input type="text" placeholder="Station Name" value="VARUNA-001 (Panchaganga)" class="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 font-medium outline-none focus:ring-2 focus:ring-teal-500" />
                <div class="flex gap-2">
                  <input type="text" placeholder="Lat" value="16.7050" class="w-1/2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 font-medium outline-none focus:ring-2 focus:ring-teal-500" />
                  <input type="text" placeholder="Lng" value="74.2430" class="w-1/2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 font-medium outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <button (click)="clearCache()" class="px-4 py-2.5 bg-rose-50 text-rose-700 font-bold border border-rose-200 rounded-xl hover:bg-rose-100 transition-all text-xs flex items-center gap-2 w-full justify-center mt-2">
                  Clear Offline SQLite Cache
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
