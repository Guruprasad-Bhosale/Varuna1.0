import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Search, Bell, Menu, Sliders } from 'lucide-angular';
import { ThresholdService } from '../../services/threshold.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input() lastSyncTime: string | null = null;
  @Output() openSidebar = new EventEmitter<void>();

  readonly SearchIcon = Search;
  readonly BellIcon = Bell;
  readonly MenuIcon = Menu;
  readonly SlidersIcon = Sliders;

  currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  constructor(private thresholdService: ThresholdService) {}

  isOnline = navigator.onLine;

  ngOnInit() {
    window.addEventListener('online', this.updateOnlineStatus);
    window.addEventListener('offline', this.updateOnlineStatus);
  }

  ngOnDestroy() {
    window.removeEventListener('online', this.updateOnlineStatus);
    window.removeEventListener('offline', this.updateOnlineStatus);
  }

  private updateOnlineStatus = () => {
    this.isOnline = navigator.onLine;
  };

  onOpenSidebar() {
    this.openSidebar.emit();
  }

  openThresholdModal() {
    this.thresholdService.setModalOpen(true);
  }

  openWaModal() {
    window.dispatchEvent(new CustomEvent('open-whatsapp-modal'));
  }
}
