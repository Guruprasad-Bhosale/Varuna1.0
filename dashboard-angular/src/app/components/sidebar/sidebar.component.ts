import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  tab: string;
  iconPath: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Mobile Backdrop -->
    @if (isOpen()) {
      <div 
        (click)="close.emit()" 
        class="fixed inset-0 z-[1050] bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity">
      </div>
    }

    <!-- Sidebar Container -->
    <aside 
      [class.-translate-x-full]="!isOpen()"
      class="fixed top-0 left-0 bottom-0 z-[1100] w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:z-10 shadow-sm">
      
      <!-- Top Brand Header -->
      <div>
        <div class="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
          <div class="h-9 w-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/30">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <span class="font-black text-slate-900 text-lg tracking-tight">SagarDrishti</span>
            <div class="text-[10px] font-bold text-teal-600 tracking-wider uppercase">IoT River Monitor</div>
          </div>
        </div>

        <!-- Navigation Links -->
        <div class="px-3 py-5">
          <div class="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Mission Control
          </div>
          <nav class="space-y-1">
            @for (item of navItems; track item.tab) {
              <a 
                [routerLink]="['/dashboard']"
                [queryParams]="{ tab: item.tab }"
                routerLinkActive="bg-teal-50 text-teal-700 font-bold border-r-4 border-teal-600 shadow-sm"
                [routerLinkActiveOptions]="{ exact: false }"
                (click)="close.emit()"
                class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                <div class="flex items-center gap-3">
                  <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="item.iconPath" />
                  </svg>
                  <span>{{ item.label }}</span>
                </div>
                @if (item.badge) {
                  <span class="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-rose-100 text-rose-700">
                    {{ item.badge }}
                  </span>
                }
              </a>
            }
          </nav>
        </div>
      </div>

      <!-- Bottom Gateway Status Widget -->
      <div class="p-4 border-t border-slate-100">
        <div class="p-3 bg-emerald-50/80 border border-emerald-200/70 rounded-xl flex items-center gap-3">
          <span class="relative flex h-3 w-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div>
            <div class="text-xs font-bold text-emerald-950">Gateway Online</div>
            <div class="text-[10px] text-emerald-700 font-medium">All edge nodes active</div>
          </div>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  isOpen = input<boolean>(false);
  close = output<void>();

  readonly navItems: NavItem[] = [
    { label: 'Overview', tab: 'overview', iconPath: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { label: 'River Nodes', tab: 'nodes', iconPath: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
    { label: 'Live Monitoring', tab: 'live', iconPath: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { label: 'Historical Trends', tab: 'trends', iconPath: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z' },
    { label: 'Alerts', tab: 'alerts', iconPath: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', badge: 2 },
    { label: 'Camera Screening', tab: 'camera', iconPath: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z' },
    { label: 'Settings', tab: 'settings', iconPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    { label: 'Deploy a Node', tab: 'contact', iconPath: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' }
  ];
}
