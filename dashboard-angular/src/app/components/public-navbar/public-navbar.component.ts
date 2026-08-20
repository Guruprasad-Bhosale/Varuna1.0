import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-public-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav [class]="'fixed top-0 w-full z-50 transition-all duration-300 ' + (scrolled ? 'bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-slate-800' : 'bg-slate-900 border-b border-slate-800')">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center cursor-pointer" routerLink="/">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mr-3 shadow-lg shadow-cyan-500/20">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <span class="font-bold text-xl tracking-tight text-white">VARUNA</span>
          </div>

          <!-- Desktop Menu -->
          <div class="hidden md:flex items-center space-x-8">
            <a routerLink="/about" class="text-sm font-medium text-slate-300 hover:text-white transition-colors">Mission</a>
            <a routerLink="/features/iot-hardware-node" class="text-sm font-medium text-slate-300 hover:text-white transition-colors">Technology</a>
            <a routerLink="/case-studies" class="text-sm font-medium text-slate-300 hover:text-white transition-colors">Deployments</a>
            <a routerLink="/blog" class="text-sm font-medium text-slate-300 hover:text-white transition-colors">Insights</a>
            <a routerLink="/dashboard" class="ml-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500">
              Live Telemetry
              <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </a>
          </div>

          <!-- Mobile menu button -->
          <div class="md:hidden flex items-center">
            <button (click)="isMobileMenuOpen = !isMobileMenuOpen" class="text-slate-300 hover:text-white p-2">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path *ngIf="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                <path *ngIf="isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div *ngIf="isMobileMenuOpen" class="md:hidden bg-slate-900 border-b border-slate-800">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <a routerLink="/about" (click)="isMobileMenuOpen = false" class="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800">Mission</a>
          <a routerLink="/features/iot-hardware-node" (click)="isMobileMenuOpen = false" class="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800">Technology</a>
          <a routerLink="/case-studies" (click)="isMobileMenuOpen = false" class="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800">Deployments</a>
          <a routerLink="/blog" (click)="isMobileMenuOpen = false" class="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800">Insights</a>
        </div>
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
