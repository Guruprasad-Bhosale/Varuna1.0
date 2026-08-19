import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { LucideAngularModule, X, CheckCircle2, MessageCircle, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-whatsapp-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './whatsapp-modal.component.html',
  styleUrls: ['./whatsapp-modal.component.css']
})
export class WhatsappModalComponent implements OnInit, OnDestroy {
  isOpen = false;
  
  readonly XIcon = X;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly MessageCircleIcon = MessageCircle;
  readonly ArrowRightIcon = ArrowRight;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly RefreshCwIcon = RefreshCw;

  // Mock Base64 QR code to demonstrate DomSanitizer usage
  private rawBase64Qr = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0xMCAxMGg4MHY4MEgxMHoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI1Ii8+PC9zdmc+';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    window.addEventListener('open-whatsapp-modal', this.openModal);
  }

  ngOnDestroy() {
    window.removeEventListener('open-whatsapp-modal', this.openModal);
  }

  openModal = () => {
    this.isOpen = true;
  }

  closeModal() {
    this.isOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isOpen) {
      this.closeModal();
    }
  }

  // Pre-flight check 1: DomSanitizer for base64 frames/images
  sanitizeBase64(dataUrl: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(dataUrl);
  }

  get safeQrUrl(): SafeUrl {
    return this.sanitizeBase64(this.rawBase64Qr);
  }
}
