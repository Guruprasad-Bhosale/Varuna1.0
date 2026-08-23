import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-public-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav [class]="'fixed top-0 w-full z-50 transition-all duration-300 ' + (scrolled ? 'bg-white/95 backdrop-blur-md shadow-[0px_4px_0px_0px_#0f172a] border-b-2 border-slate-900' : 'bg-transparent border-b-2 border-slate-900 shadow-[0px_4px_0px_0px_#0f172a]')">
      <!-- Add the graph-paper pattern overlay if not scrolled -->
      <div *ngIf="!scrolled" class="absolute inset-0 z-[-1]" style="background-image: radial-gradient(#cbd5e1 1.2px, transparent 1.2px), linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px); background-size: 24px 24px, 120px 120px, 120px 120px; background-color: #f8fafc;"></div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center cursor-pointer stamp-card px-2 py-1 transform -rotate-1 hover:rotate-0 transition-transform bg-white" routerLink="/">
            <div class="w-6 h-6 rounded border-2 border-slate-900 bg-teal-50 flex items-center justify-center mr-2 shadow-[2px_2px_0px_0px_#0f172a]">
              <svg class="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <span class="font-black text-sm tracking-widest text-slate-900 uppercase">VARUNA // SINDHUDURG BASIN LOGBOOK</span>
          </div>

          <!-- Desktop Menu -->
          <div class="hidden md:flex items-center space-x-6">
            <a routerLink="/about" routerLinkActive="highlighter-teal underline decoration-slate-900 decoration-2 underline-offset-4" class="text-sm font-extrabold text-slate-900 hover:rotate-[-1deg] transition-transform inline-block uppercase tracking-wider">Mission</a>
            <a routerLink="/features/iot-hardware-node" routerLinkActive="highlighter-teal underline decoration-slate-900 decoration-2 underline-offset-4" class="text-sm font-extrabold text-slate-900 hover:rotate-[-1deg] transition-transform inline-block uppercase tracking-wider">Technology</a>
            <a routerLink="/case-studies" routerLinkActive="highlighter-teal underline decoration-slate-900 decoration-2 underline-offset-4" class="text-sm font-extrabold text-slate-900 hover:rotate-[-1deg] transition-transform inline-block uppercase tracking-wider">Deployments</a>
            <a routerLink="/blog" routerLinkActive="highlighter-teal underline decoration-slate-900 decoration-2 underline-offset-4" class="text-sm font-extrabold text-slate-900 hover:rotate-[-1deg] transition-transform inline-block uppercase tracking-wider">Insights</a>
            
            <a routerLink="/dashboard" class="ml-4 stamp-btn bg-teal-600 hover:bg-teal-500 text-white font-black px-4 py-2 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none inline-flex items-center uppercase tracking-wider text-xs">
              Live Telemetry
              <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </a>
          </div>

          <!-- Mobile menu button -->
          <div class="md:hidden flex items-center">
            <button (click)="isMobileMenuOpen = !isMobileMenuOpen" class="text-slate-900 hover:text-teal-600 p-2 stamp-btn bg-white rounded-lg px-2 py-1 shadow-[2px_2px_0px_0px_#0f172a]">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path *ngIf="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h16M4 18h16" />
                <path *ngIf="isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Drawer -->
      <div *ngIf="isMobileMenuOpen" class="md:hidden mt-3 p-4 bg-white border-2 border-slate-900 rounded-2xl shadow-[4px_4px_0px_0px_#0f172a] space-y-3 mx-4 mb-4 relative z-50">
        <a (click)="isMobileMenuOpen = false" routerLink="/about" class="block font-black uppercase tracking-wider text-slate-900 py-2 px-3 rounded-lg hover:bg-teal-50 border-2 border-transparent hover:border-slate-900">
          Mission & Basin Scope
        </a>
        <a (click)="isMobileMenuOpen = false" routerLink="/features/iot-hardware-node" class="block font-black uppercase tracking-wider text-slate-900 py-2 px-3 rounded-lg hover:bg-teal-50 border-2 border-transparent hover:border-slate-900">
          Edge & Satellite Tech
        </a>
        <a (click)="isMobileMenuOpen = false" routerLink="/case-studies" class="block font-black uppercase tracking-wider text-slate-900 py-2 px-3 rounded-lg hover:bg-teal-50 border-2 border-transparent hover:border-slate-900">
          Active Deployments
        </a>
        <a (click)="isMobileMenuOpen = false" routerLink="/blog" class="block font-black uppercase tracking-wider text-slate-900 py-2 px-3 rounded-lg hover:bg-teal-50 border-2 border-transparent hover:border-slate-900">
          Field Logbook & Insights
        </a>
        <a (click)="isMobileMenuOpen = false" routerLink="/dashboard" class="block text-center stamp-btn bg-teal-600 hover:bg-teal-500 text-white py-3 rounded-xl font-black uppercase tracking-wider border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none mt-4">
          Live Telemetry &rarr;
        </a>
      </div>
    </nav>
  `
})
export class PublicNavbarComponent {
  scrolled = false;
  isMobileMenuOpen = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 20;
  }
}
