import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="border-t-2 border-slate-900 py-12 px-6 pb-24 md:pb-12" style="background-color: #f8fafc; background-image: radial-gradient(#cbd5e1 1.2px, transparent 1.2px), linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px); background-size: 24px 24px, 120px 120px, 120px 120px;">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div class="col-span-1 md:col-span-2">
            <div class="flex items-center mb-4">
              <span class="font-black text-lg tracking-tight text-slate-900 uppercase">Project VARUNA — River Intelligence Platform</span>
            </div>
            <p class="text-sm font-bold max-w-sm mb-6 text-slate-700 leading-relaxed">
              Real-time IoT edge telemetry, optical particulate flow analysis, and NIRVAAH 27-feature XGBoost bloom forecasting across the Sindhudurg Basin.
            </p>
            
            <div class="mt-4">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-md border-2 border-slate-900 bg-teal-50 text-teal-900 font-mono text-[11px] font-black uppercase shadow-[2px_2px_0px_0px_#0f172a] rotate-[-1deg]">
                <span class="h-2 w-2 rounded-full bg-teal-600 animate-pulse"></span>
                <span>[ SLA: 20M SAMPLING CYCLE • < 3S DISPATCH ]</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 class="font-mono font-black text-xs uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-1.5">// 01. TECHNOLOGY</h3>
            <ul class="space-y-3">
              <li><a routerLink="/features/iot-hardware-node" class="text-xs font-bold text-slate-800 hover:text-teal-700 hover:underline transition-colors uppercase tracking-wider">Hardware Nodes</a></li>
              <li><a routerLink="/features/edge-ai-classification" class="text-xs font-bold text-slate-800 hover:text-teal-700 hover:underline transition-colors uppercase tracking-wider">Edge AI Inference</a></li>
              <li><a routerLink="/features/optical-particle-screener" class="text-xs font-bold text-slate-800 hover:text-teal-700 hover:underline transition-colors uppercase tracking-wider">Optical Screening</a></li>
              <li><a routerLink="/features/automated-alert-gateway" class="text-xs font-bold text-slate-800 hover:text-teal-700 hover:underline transition-colors uppercase tracking-wider">Alert Gateway</a></li>
              <li><a href="/public/llms.txt" target="_blank" class="text-xs font-bold text-slate-800 hover:text-teal-700 hover:underline transition-colors uppercase tracking-wider">AI Manifest (llms.txt)</a></li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-mono font-black text-xs uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-1.5">// 02. ORGANIZATION</h3>
            <ul class="space-y-3">
              <li><a routerLink="/about" class="text-xs font-bold text-slate-800 hover:text-teal-700 hover:underline transition-colors uppercase tracking-wider">Our Mission</a></li>
              <li><a routerLink="/case-studies" class="text-xs font-bold text-slate-800 hover:text-teal-700 hover:underline transition-colors uppercase tracking-wider">Case Studies</a></li>
              <li><a routerLink="/blog" class="text-xs font-bold text-slate-800 hover:text-teal-700 hover:underline transition-colors uppercase tracking-wider">Technical Blog</a></li>
              <li><a routerLink="/faq" class="text-xs font-bold text-slate-800 hover:text-teal-700 hover:underline transition-colors uppercase tracking-wider">FAQ</a></li>
              <li><a routerLink="/contact" class="text-xs font-bold text-slate-800 hover:text-teal-700 hover:underline transition-colors uppercase tracking-wider">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div class="mt-12 pt-8 border-t-2 border-slate-900 flex flex-col md:flex-row justify-between items-center text-xs">
          <p class="font-mono font-black text-[11px] text-slate-500 uppercase tracking-widest">LAT: 16.0822° N | LNG: 73.4685° E // GAD & KARLI BASIN</p>
          <div class="flex space-x-4 mt-6 md:mt-0 items-center">
            <a routerLink="/privacy" class="font-mono font-black text-[11px] text-slate-500 uppercase hover:text-slate-900 transition-colors tracking-widest">Privacy</a>
            <a routerLink="/terms" class="font-mono font-black text-[11px] text-slate-500 uppercase hover:text-slate-900 transition-colors tracking-widest">Terms</a>
            <a href="https://github.com/Guruprasad-Bhosale/Varuna1.0" target="_blank" class="border-2 border-slate-900 bg-white p-1.5 rounded-lg text-slate-900 shadow-[2px_2px_0px_0px_#0f172a] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#0f172a] transition-all">
              <span class="sr-only">GitHub</span>
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" /></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class PublicFooterComponent {}
