import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-4">
      <div class="mb-8 relative">
        <div class="text-[12rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-cyan-600 to-slate-800 leading-none opacity-80 select-none">
          404
        </div>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="bg-slate-900 px-4 py-2 border-2 border-cyan-500/30 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <span class="text-cyan-400 font-mono text-sm tracking-widest uppercase">Signal Lost</span>
          </div>
        </div>
      </div>
      
      <h1 class="text-3xl font-bold text-white mb-4">Telemetry Stream Not Found</h1>
      <p class="text-slate-400 max-w-md mx-auto mb-10">The routing parameter or node ID you requested does not exist on the SagarDrishti network. Please check the URL or return to the active monitoring grid.</p>
      
      <div class="flex flex-col sm:flex-row gap-4">
        <a routerLink="/" class="inline-flex justify-center items-center px-6 py-3 border border-transparent text-sm font-bold rounded-lg text-white bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-500/20 transition-all">
          <svg class="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          Return Home
        </a>
        <a routerLink="/dashboard" class="inline-flex justify-center items-center px-6 py-3 border border-slate-700 text-sm font-bold rounded-lg text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all">
          <svg class="mr-2 w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          Live Cockpit
        </a>
      </div>
    </div>
  `
})
export class NotFoundComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: 'Page Not Found',
      description: 'The requested route was not found on the SagarDrishti network.',
    });
  }
}
