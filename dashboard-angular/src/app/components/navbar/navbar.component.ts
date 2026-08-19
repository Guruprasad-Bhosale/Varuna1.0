import { Component, Input, Output, EventEmitter } from '@angular/core';
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
export class NavbarComponent {
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
