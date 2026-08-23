import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-thank-you',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-slate-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full text-center bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        <div class="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 mb-6">
          <svg class="h-10 w-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 class="text-3xl font-extrabold text-slate-900 mb-4">Inquiry Received!</h2>
        <p class="text-slate-600 mb-8">Thank you for your interest in Project JalDrishti. Our engineering team will review your deployment requirements and contact you within 24 hours.</p>
        
        <a routerLink="/" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition">
          Return to Home
        </a>
      </div>
    </div>
  `
})
export class ThankYouComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: 'Thank You',
      description: 'Your inquiry has been received by the JalDrishti team.',
      canonicalUrl: 'https://jaldrishti.org/thank-you'
    });
  }
}

