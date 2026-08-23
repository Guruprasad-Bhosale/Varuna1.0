import { Component, OnInit, ChangeDetectionStrategy, inject, NgZone, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="showBanner()" class="fixed bottom-0 left-0 right-0 z-[100] md:bottom-6 md:left-auto md:right-6 md:max-w-sm bg-slate-900 border-t md:border border-slate-700 shadow-2xl md:rounded-xl p-5 transform transition-all duration-500 ease-out translate-y-0 opacity-100">
      <div class="flex justify-between items-start mb-3">
        <h4 class="text-white font-semibold text-sm">Telemetry Consent</h4>
      </div>
      <p class="text-slate-400 text-xs leading-relaxed mb-4">
        We use cookies and anonymous analytics to improve the JalDrishti platform dashboard. By continuing to use the portal, you agree to our 
        <a href="/privacy" class="text-cyan-400 hover:underline">Privacy Policy</a>.
      </p>
      <div class="flex space-x-3">
        <button (click)="accept()" class="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold py-2 rounded-lg transition">Accept</button>
        <button (click)="decline()" class="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-2 rounded-lg transition">Decline</button>
      </div>
    </div>
  `
})
export class CookieConsentComponent implements OnInit {
  showBanner = signal(false);
  private readonly CONSENT_KEY = 'jaldrishti_cookie_consent';
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    // Only show if not previously acknowledged
    if (!localStorage.getItem(this.CONSENT_KEY)) {
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.showBanner.set(true);
          this.cdr.detectChanges();
        }, 1500); // delay show
      });
    }
  }

  accept() {
    localStorage.setItem(this.CONSENT_KEY, 'accepted');
    this.showBanner.set(false);
  }

  decline() {
    localStorage.setItem(this.CONSENT_KEY, 'declined');
    this.showBanner.set(false);
  }
}
