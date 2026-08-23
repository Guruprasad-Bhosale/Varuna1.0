import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasinDeploymentTiersComponent } from '../../../../components/ui/basin-deployment-tiers/basin-deployment-tiers.component';

@Component({
  selector: 'app-contact-view',
  standalone: true,
  imports: [CommonModule, BasinDeploymentTiersComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-12 max-w-7xl mx-auto px-4 py-6">

      <!-- 1. Deployment Tier Selector -->
      <div class="space-y-4">
        <app-basin-deployment-tiers 
          (tierSelected)="onTierSelect($event)">
        </app-basin-deployment-tiers>
      </div>

      <!-- 2. Split Contact & Inquiry Section -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-6 border-t border-slate-200">
        
        <!-- Left Column: Contact & Lab Details -->
        <div class="lg:col-span-5 space-y-6">
          <div>
            <h2 class="text-3xl font-black text-slate-900 tracking-tight">Deploy a Node</h2>
            <p class="text-sm text-slate-600 mt-2 leading-relaxed">
              Ready to automate your river quality monitoring? Reach out to our engineering team to discuss basin requirements, API integrations, and pilot deployments.
            </p>
          </div>

          <!-- Contact Detail Cards (Email, Dispatch, Lab Facilities) -->
          <div class="space-y-4 pt-4">
            <div class="flex items-start gap-3.5 p-4 stamp-card bg-white relative group">
              <div class="absolute -top-3 -left-3 w-8 h-8 bg-teal-100 border-2 border-slate-900 rounded-full flex items-center justify-center transform -rotate-12 shadow-[2px_2px_0px_0px_#0f172a]">
                <svg class="w-4 h-4 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              </div>
              <div class="pl-4">
                <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Email Us</div>
                <div class="text-sm font-bold font-mono text-slate-900 underline decoration-slate-300 decoration-2 underline-offset-4">contact&#64;varuna-iot.org</div>
              </div>
            </div>
            
            <div class="flex items-start gap-3.5 p-4 stamp-card bg-white relative group">
              <div class="absolute -top-3 -left-3 w-8 h-8 bg-amber-100 border-2 border-slate-900 rounded-full flex items-center justify-center transform rotate-6 shadow-[2px_2px_0px_0px_#0f172a]">
                <svg class="w-4 h-4 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <div class="pl-4">
                <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Incident Dispatch</div>
                <div class="text-sm font-bold font-mono text-slate-900 underline decoration-slate-300 decoration-2 underline-offset-4">WhatsApp SLA Direct Line</div>
              </div>
            </div>

            <div class="flex items-start gap-3.5 p-4 stamp-card bg-white relative group">
              <div class="absolute -top-3 -left-3 w-8 h-8 bg-rose-100 border-2 border-slate-900 rounded-full flex items-center justify-center transform -rotate-6 shadow-[2px_2px_0px_0px_#0f172a]">
                <svg class="w-4 h-4 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
              </div>
              <div class="pl-4">
                <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Hardware Lab</div>
                <div class="text-sm font-bold font-mono text-slate-900 underline decoration-slate-300 decoration-2 underline-offset-4">Pune Institute Edge AI Sandbox</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Inquiry Form -->
        <div id="inquiry-form" class="lg:col-span-7 stamp-card p-6 sm:p-10 bg-white relative space-y-8">
          <div class="washi-tape-top absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-teal-100/80 z-20 transform -rotate-1"></div>
          
          <div class="flex items-center justify-between border-b-2 border-slate-900 pb-2">
            <h3 class="text-xl font-black text-slate-900 uppercase">Engineering Inquiry Ledger</h3>
            <span class="text-[10px] font-black font-mono text-slate-500">REF: {{ selectedInquiryType().substring(0, 3).toUpperCase() }}-{{ currentYear }}</span>
          </div>

          <div class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                <input type="text" class="w-full px-3 py-2 rounded-xl border-2 border-slate-900 font-mono font-bold text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:shadow-[4px_4px_0px_0px_#0f172a] focus:outline-none transition-all shadow-[2px_2px_0px_0px_#0f172a]" placeholder="Dr. Rajesh Patil" />
              </div>

              <div>
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Organization</label>
                <input type="text" class="w-full px-3 py-2 rounded-xl border-2 border-slate-900 font-mono font-bold text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:shadow-[4px_4px_0px_0px_#0f172a] focus:outline-none transition-all shadow-[2px_2px_0px_0px_#0f172a]" placeholder="Pollution Control Board" />
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Inquiry Type</label>
              <select [value]="selectedInquiryType()" (change)="selectedInquiryType.set($any($event.target).value)" class="w-full px-3 py-2 rounded-xl border-2 border-slate-900 font-mono font-bold text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:shadow-[4px_4px_0px_0px_#0f172a] focus:outline-none transition-all shadow-[2px_2px_0px_0px_#0f172a] cursor-pointer appearance-none">
                <option value="Community Sentinel">Community Sentinel ($29/mo)</option>
                <option value="Municipal Pilot Deployment">Municipal Pilot Deployment ($149/mo)</option>
                <option value="State Environmental Grid">State Environmental Grid ($499/mo)</option>
                <option value="Custom Hardware Architecture">Custom Hardware Architecture</option>
              </select>
            </div>

            <div>
              <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Message / Deployment Requirements</label>
              <textarea rows="4" class="w-full px-3 py-2 rounded-xl border-2 border-slate-900 font-mono font-bold text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:shadow-[4px_4px_0px_0px_#0f172a] focus:outline-none transition-all shadow-[2px_2px_0px_0px_#0f172a] resize-none" placeholder="Specify river stretch, sampling frequency..."></textarea>
            </div>

            <div class="pt-4 flex justify-end">
              <button class="stamp-btn bg-slate-900 hover:bg-teal-700 text-white font-black uppercase text-sm px-8 py-3 transition-colors">
                Submit Record &rarr;
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class ContactViewComponent {
  currentYear = new Date().getFullYear();
  selectedInquiryType = signal<string>('Municipal Pilot Deployment');

  onTierSelect(tierName: string): void {
    if (tierName.includes('Community')) {
      this.selectedInquiryType.set('Community Sentinel');
    } else if (tierName.includes('State')) {
      this.selectedInquiryType.set('State Environmental Grid');
    } else {
      this.selectedInquiryType.set('Municipal Pilot Deployment');
    }

    // Smooth-scroll down to the inquiry form
    document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' });
  }
}
