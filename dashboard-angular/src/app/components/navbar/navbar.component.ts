import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, NgZone, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Search, Bell, Menu, Sliders } from 'lucide-angular';
import { ThresholdService } from '../../services/threshold.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input() lastSyncTime: string | null = null;
  @Output() openSidebar = new EventEmitter<void>();

  readonly SearchIcon = Search;
  readonly BellIcon = Bell;
  readonly MenuIcon = Menu;
  readonly SlidersIcon = Sliders;

  currentDate = new Date().toLocaleDateString('en-GB', { 
    year: 'numeric', month: 'short', day: '2-digit' 
  }).toUpperCase();
  
  currentTimeStr: string = this.getFormattedTime();
  
  private clockInterval: ReturnType<typeof setInterval> | undefined;
  private ngZone = inject(NgZone);

  constructor(private thresholdService: ThresholdService, private cdr: ChangeDetectorRef) {}

  isOnline = navigator.onLine;

  ngOnInit() {
    window.addEventListener('online', this.updateOnlineStatus);
    window.addEventListener('offline', this.updateOnlineStatus);
    
    this.ngZone.runOutsideAngular(() => {
      this.clockInterval = setInterval(() => {
        this.currentTimeStr = this.getFormattedTime();
        this.cdr.detectChanges(); // Use detectChanges to sync the view immediately
      }, 1000);
    });
  }

  ngOnDestroy() {
    window.removeEventListener('online', this.updateOnlineStatus);
    window.removeEventListener('offline', this.updateOnlineStatus);
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  getFormattedTime(): string {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  private updateOnlineStatus = () => {
    this.isOnline = navigator.onLine;
    this.cdr.markForCheck();
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
