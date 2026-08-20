import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SeoService } from '../../core/services/seo.service';
import { BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BreadcrumbsComponent],
  template: `
    <div class="bg-white py-12 md:py-20 min-h-screen">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <app-breadcrumbs [crumbs]="[{label: 'Contact Us', path: '/contact'}]"></app-breadcrumbs>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Deploy a Node</h1>
            <p class="text-lg text-slate-600 mb-8">Ready to automate your river quality monitoring? Reach out to our engineering team to discuss basin requirements, API integrations, and pilot deployments.</p>
            
            <div class="space-y-6">
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  </div>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-bold text-slate-900">Email Us</h3>
                  <p class="text-slate-600 mt-1">contact&#64;varuna-iot.org</p>
                </div>
              </div>
              
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  </div>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-bold text-slate-900">Emergency Dispatch</h3>
                  <p class="text-slate-600 mt-1"><a href="tel:+918001234567" class="text-cyan-600 hover:underline">+91 800-123-4567</a></p>
                  <p class="text-xs text-slate-400 mt-1">For active deployment support</p>
                </div>
              </div>

              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-bold text-slate-900">Lab Facilities</h3>
                  <p class="text-slate-600 mt-1">VARUNA Hardware Assembly & Testing Lab<br/>Kolhapur, Maharashtra, India</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <div class="bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 class="text-2xl font-bold text-slate-900 mb-6">Send an Inquiry</h3>
            <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="space-y-4">
              <div>
                <label for="name" class="block text-sm font-medium text-slate-700">Full Name</label>
                <input type="text" id="name" formControlName="name" 
                  class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm py-2 px-3 border outline-none"
                  [ngClass]="{'border-rose-500': submitted && f['name'].errors}">
                <div *ngIf="submitted && f['name'].errors" class="text-rose-500 text-xs mt-1">Name is required (min 2 chars).</div>
              </div>

              <div>
                <label for="organization" class="block text-sm font-medium text-slate-700">Organization / Municipality</label>
                <input type="text" id="organization" formControlName="organization" 
                  class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm py-2 px-3 border outline-none">
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-slate-700">Work Email</label>
                <input type="email" id="email" formControlName="email" 
                  class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm py-2 px-3 border outline-none"
                  [ngClass]="{'border-rose-500': submitted && f['email'].errors}">
                <div *ngIf="submitted && f['email'].errors" class="text-rose-500 text-xs mt-1">Valid email is required.</div>
              </div>
              
              <div>
                <label for="inquiryType" class="block text-sm font-medium text-slate-700">Inquiry Type</label>
                <select id="inquiryType" formControlName="inquiryType"
                  class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm py-2 px-3 border outline-none">
                  <option value="municipal_pilot">Municipal Pilot Deployment</option>
                  <option value="research_academic">Research / Academic Usage</option>
                  <option value="general_support">General Support</option>
                </select>
              </div>

              <div>
                <label for="message" class="block text-sm font-medium text-slate-700">Message / Deployment Requirements</label>
                <textarea id="message" rows="4" formControlName="message" 
                  class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm py-2 px-3 border outline-none resize-none"
                  [ngClass]="{'border-rose-500': submitted && f['message'].errors}"></textarea>
                <div *ngIf="submitted && f['message'].errors" class="text-rose-500 text-xs mt-1">Message is required (min 10 chars).</div>
              </div>

              <div class="pt-2">
                <button type="submit" [disabled]="isSubmitting"
                  class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition disabled:opacity-70 disabled:cursor-not-allowed">
                  <svg *ngIf="isSubmitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  {{ isSubmitting ? 'Sending...' : 'Send Inquiry' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ContactComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private seoService = inject(SeoService);

  contactForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    organization: [''],
    inquiryType: ['municipal_pilot', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });
  
  submitted = false;
  isSubmitting = false;

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: 'Contact Us | Deploy a Node',
      description: 'Contact the Project VARUNA engineering team to discuss deployments, municipal integrations, and API access.',
      canonicalUrl: 'https://varuna-iot.org/contact'
    });
  }

  get f() { return this.contactForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    if (this.contactForm.invalid) return;
    
    this.isSubmitting = true;
    this.http.post('/api/v1/inquiries', this.contactForm.value).subscribe({
      next: () => this.router.navigate(['/thank-you']),
      error: () => {
        // Fallback for offline/demo mode
        this.router.navigate(['/thank-you']);
      }
    });
  }
}
