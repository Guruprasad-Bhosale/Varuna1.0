import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, LayoutDashboard, Map, Activity, Bell, Camera, Settings, Network, CheckCircle2 } from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() activeTab: string = 'overview';
  @Output() activeTabChange = new EventEmitter<string>();

  @Input() isSidebarOpen: boolean = false;
  @Output() isSidebarOpenChange = new EventEmitter<boolean>();

  // Use the icon components from lucide-angular
  menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'map', label: 'River Nodes', icon: Map },
    { id: 'live', label: 'Live Monitoring', icon: Activity },
    { id: 'trends', label: 'Historical Trends', icon: Network },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'camera', label: 'Camera Screening', icon: Camera },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  readonly CheckCircle2Icon = CheckCircle2;

  setActiveTab(id: string) {
    this.activeTab = id;
    this.activeTabChange.emit(id);
  }

  closeSidebar() {
    this.isSidebarOpen = false;
    this.isSidebarOpenChange.emit(false);
  }
}
