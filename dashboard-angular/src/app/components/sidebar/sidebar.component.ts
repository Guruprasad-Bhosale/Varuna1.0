import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Map as MapIcon, Activity, Network, Bell, Camera, Settings, CheckCircle2 } from 'lucide-angular';
import { DashboardTab } from '../../pages/dashboard/dashboard.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <!-- Mobile Sidebar Backdrop -->
    <div *ngIf="isSidebarOpen" class="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity z-[1050] lg:hidden" (click)="closeSidebar()"></div>

    <aside
      [class.translate-x-0]="isSidebarOpen"
      [class.-translate-x-full]="!isSidebarOpen"
      class="fixed inset-y-0 left-0 z-[1100] w-72 bg-slate-950 text-slate-200 border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-10 flex flex-col shadow-xl">
      
      <!-- Brand Header -->
      <div class="h-20 flex items-center px-6 border-b border-slate-200">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent tracking-tight">VARUNA</h1>
            <div class="text-[10px] text-cyan-600 font-medium tracking-widest uppercase">IoT River Monitor</div>
          </div>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
        <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Mission Control</div>
        
        @for (item of menuItems; track item.id) {
          <button
            (click)="setActiveTab(item.id)"
            [ngClass]="activeTab === item.id 
              ? 'bg-cyan-50 text-cyan-700 border-cyan-200 font-semibold shadow-[inset_4px_0_0_rgba(6,182,212,1)]' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent'"
            class="w-full flex items-center justify-between px-3 py-3 rounded-xl border transition-all duration-200 group">
            
            <div class="flex items-center gap-3">
              <i-lucide [name]="item.icon" 
                [ngClass]="activeTab === item.id ? 'text-cyan-600' : 'text-slate-400 group-hover:text-slate-600'"
                class="w-5 h-5 transition-colors">
              </i-lucide>
              <span class="text-sm">{{ item.label }}</span>
            </div>

            <!-- Optional badges like alert count -->
            @if (item.badge) {
              <span class="bg-rose-500/20 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/30 animate-pulse">
                {{ item.badge }}
              </span>
            }
          </button>
        }
      </nav>

      <!-- System Status Footer -->
      <div class="p-4 border-t border-slate-200 bg-slate-50">
        <div class="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
          <div class="relative flex h-3 w-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div>
            <div class="text-xs text-slate-700 font-medium">Gateway Online</div>
            <div class="text-[10px] text-slate-500">All edge nodes active</div>
          </div>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  @Input() activeTab: string = 'nodes';
  @Output() activeTabChange = new EventEmitter<string>();

  @Input() isSidebarOpen: boolean = false;
  @Output() isSidebarOpenChange = new EventEmitter<boolean>();

  menuItems: {id: string, label: string, icon: string, badge?: number}[] = [
    { id: 'overview', label: 'Overview', icon: 'layout-dashboard' },
    { id: 'nodes', label: 'River Nodes', icon: 'map' },
    { id: 'live', label: 'Live Monitoring', icon: 'activity' },
    { id: 'trends', label: 'Historical Trends', icon: 'network' },
    { id: 'alerts', label: 'Alerts', icon: 'bell', badge: 2 },
    { id: 'camera', label: 'Camera Screening', icon: 'camera' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  setActiveTab(id: string) {
    this.activeTabChange.emit(id);
    if(window.innerWidth < 1024) {
      this.closeSidebar();
    }
  }

  closeSidebar() {
    this.isSidebarOpenChange.emit(false);
  }
}
