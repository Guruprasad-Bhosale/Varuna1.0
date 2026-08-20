import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { PublicNavbarComponent } from '../../components/public-navbar/public-navbar.component';
import { PublicFooterComponent } from '../../components/public-footer/public-footer.component';
import { CookieConsentComponent } from '../../components/cookie-consent/cookie-consent.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, PublicNavbarComponent, PublicFooterComponent, CookieConsentComponent],
  template: `
    <div class="flex min-h-screen flex-col bg-slate-50 text-slate-900 selection:bg-cyan-500/30">
      <app-public-navbar></app-public-navbar>
      
      <main class="flex-1 mt-16">
        <router-outlet></router-outlet>
      </main>

      <app-public-footer></app-public-footer>
      
      <!-- Sticky Mobile CTA Dock -->
      <div class="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-900 border-t border-slate-800 p-3 flex justify-between shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
        <a href="tel:+918001234567" class="flex-1 flex items-center justify-center space-x-2 bg-slate-800 text-white rounded-lg py-2.5 mx-1 text-sm font-semibold hover:bg-slate-700 transition">
          <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
          <span>Emergency</span>
        </a>
        <a href="/dashboard" class="flex-1 flex items-center justify-center space-x-2 bg-cyan-600 text-white rounded-lg py-2.5 mx-1 text-sm font-semibold hover:bg-cyan-500 transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          <span>Live Map</span>
        </a>
      </div>

      <app-cookie-consent></app-cookie-consent>
    </div>
  `
})
export class PublicLayoutComponent {}
