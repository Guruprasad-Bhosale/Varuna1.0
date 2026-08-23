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
            <p class="text-sm text-slate-600 mt-2 leading-relaxed font-medium">
              Ready to automate your river quality monitoring? Reach out to our engineering team to discuss basin requirements, API integrations, and pilot deployments.
            </p>
          </div>

          <!-- Contact Detail Cards -->
          <div class="space-y-4 pt-4">
            <div class="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div class="w-10 h-10 bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center shrink-0">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              </div>
              <div>
                <div class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Us</div>
                <div class="text-sm font-bold font-mono text-slate-900">contact&#64;jaldrishti.org</div>
              </div>
            </div>
            
            <div class="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div class="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center shrink-0">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <div>
                <div class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Incident Dispatch</div>
                <div class="text-sm font-bold text-slate-900">WhatsApp SLA Direct Line</div>
              </div>
            </div>

            <div class="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div class="w-10 h-10 bg-rose-100 text-rose-700 rounded-xl flex items-center justify-center shrink-0">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
              </div>
              <div>
                <div class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Hardware Lab</div>
                <div class="text-sm font-bold text-slate-900">Pune Institute Edge AI Sandbox</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Inquiry Form -->
        <div id="inquiry-form" class="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-xl font-bold text-slate-900">Engineering Inquiry</h3>
            <span class="text-xs font-bold font-mono text-slate-500">REF: {{ selectedInquiryType().substring(0, 3).toUpperCase() }}-{{ currentYear }}</span>
          </div>

          <div class="space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
                <input type="text" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-all" placeholder="Dr. Rajesh Patil" />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Organization</label>
                <input type="text" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-all" placeholder="Pollution Control Board" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Inquiry Type</label>
              <select [value]="selectedInquiryType()" (change)="selectedInquiryType.set($any($event.target).value)" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-all cursor-pointer">
                <option value="Community Sentinel">Community Sentinel (₹2,400/mo)</option>
                <option value="Municipal Pilot Deployment">Municipal Pilot Deployment (₹12,000/mo)</option>
                <option value="State Environmental Grid">State Environmental Grid (₹41,000/mo)</option>
                <option value="Custom Hardware Architecture">Custom Hardware Architecture</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Message / Deployment Requirements</label>
              <textarea rows="4" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-all resize-none" placeholder="Specify river stretch, sampling frequency..."></textarea>
            </div>

            <div class="pt-2 flex justify-end">
              <button class="bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-md shadow-teal-600/20 hover:-translate-y-0.5 transition-all">
                Submit Inquiry &rarr;
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
