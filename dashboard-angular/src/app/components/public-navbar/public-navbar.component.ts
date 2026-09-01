import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-public-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav [class]="'fixed top-0 w-full z-50 transition-all duration-300 ' + (scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b-2 border-slate-900' : 'bg-white/90 backdrop-blur-sm border-b-2 border-slate-900')">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center cursor-pointer" routerLink="/">
            <div class="w-8 h-8 rounded-lg bg-teal-600 border-2 border-slate-900 flex items-center justify-center mr-3 shadow-[2px_2px_0px_0px_#0f172a]">
              <svg class="w-4 h-4 text-white stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <div class="flex flex-col">
              <span class="font-black text-lg sm:text-xl tracking-tight text-slate-900">SagarDrishti</span>
              <span class="font-mono text-[9px] font-black text-slate-500 tracking-wider hidden sm:inline uppercase">SINDHUDURG BASIN LOGBOOK</span>
            </div>
          </div>

          <!-- Desktop Menu -->
          <div class="hidden md:flex items-center space-x-6">
            <a routerLink="/mission" routerLinkActive="text-teal-700 underline decoration-2 underline-offset-4" class="text-sm font-black text-slate-900 hover:text-teal-700 transition-colors uppercase tracking-wider">Mission</a>
            <a routerLink="/about" routerLinkActive="text-teal-700 underline decoration-2 underline-offset-4" class="text-sm font-black text-slate-900 hover:text-teal-700 transition-colors uppercase tracking-wider">About Us</a>
            <a routerLink="/features/iot-hardware-node" routerLinkActive="text-teal-700 underline decoration-2 underline-offset-4" class="text-sm font-black text-slate-900 hover:text-teal-700 transition-colors uppercase tracking-wider">Technology</a>
            <a routerLink="/case-studies" routerLinkActive="text-teal-700 underline decoration-2 underline-offset-4" class="text-sm font-black text-slate-900 hover:text-teal-700 transition-colors uppercase tracking-wider">Deployments</a>
            <a routerLink="/blog" routerLinkActive="text-teal-700 underline decoration-2 underline-offset-4" class="text-sm font-black text-slate-900 hover:text-teal-700 transition-colors uppercase tracking-wider">Insights</a>
            
            <a routerLink="/dashboard" 
               class="stamp-btn inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs uppercase tracking-wider border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a] hover:shadow-[4px_4px_0px_0px_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all">
              <span>Live Telemetry</span>
              <svg class="h-3.5 w-3.5 text-white stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>

          <!-- Mobile menu button -->
          <div class="md:hidden flex items-center">
            <button (click)="isMobileMenuOpen = !isMobileMenuOpen" class="text-slate-900 hover:text-teal-600 p-2 rounded-lg border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] bg-white transition-colors">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path *ngIf="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h16M4 18h16" />
                <path *ngIf="isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Drawer -->
      <div *ngIf="isMobileMenuOpen" class="md:hidden bg-white border-b-2 border-slate-900 px-4 py-4 space-y-2 shadow-lg">
        <a (click)="isMobileMenuOpen = false" routerLink="/mission" class="block font-black text-slate-900 py-2 px-3 rounded-lg hover:bg-slate-100 uppercase text-xs tracking-wider">
          Mission Storybook
        </a>
        <a (click)="isMobileMenuOpen = false" routerLink="/about" class="block font-black text-slate-900 py-2 px-3 rounded-lg hover:bg-slate-100 uppercase text-xs tracking-wider">
          Meet the Team
        </a>
        <a (click)="isMobileMenuOpen = false" routerLink="/features/iot-hardware-node" class="block font-black text-slate-900 py-2 px-3 rounded-lg hover:bg-slate-100 uppercase text-xs tracking-wider">
          Edge & Satellite Tech
        </a>
        <a (click)="isMobileMenuOpen = false" routerLink="/case-studies" class="block font-black text-slate-900 py-2 px-3 rounded-lg hover:bg-slate-100 uppercase text-xs tracking-wider">
          Active Deployments
        </a>
        <a (click)="isMobileMenuOpen = false" routerLink="/blog" class="block font-black text-slate-900 py-2 px-3 rounded-lg hover:bg-slate-100 uppercase text-xs tracking-wider">
          Field Logbook & Insights
        </a>
        <a (click)="isMobileMenuOpen = false" routerLink="/dashboard" class="stamp-btn block text-center bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl font-black uppercase text-xs tracking-wider border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a] mt-3">
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

