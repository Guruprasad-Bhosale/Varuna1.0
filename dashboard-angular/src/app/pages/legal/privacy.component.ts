import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../core/services/seo.service';
import { BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, BreadcrumbsComponent],
  template: `
    <div class="bg-white py-12 md:py-20 min-h-screen">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <app-breadcrumbs [crumbs]="[{label: 'Privacy Policy', path: '/privacy'}]"></app-breadcrumbs>
        
        <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Privacy Policy</h1>
        <p class="text-sm text-slate-500 mb-12">Last Updated: August 19, 2026</p>

        <div class="prose prose-cyan text-slate-600 max-w-none">
          <h3>1. Introduction</h3>
          <p>Project SagarDrishti ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information when you use our environmental intelligence platform and IoT monitoring services, in compliance with the Digital Personal Data Protection (DPDP) Act and GDPR.</p>

          <h3>2. Environmental Data Collection</h3>
          <p>The core of our platform relies on deploying hardware nodes that collect purely environmental data (pH, Turbidity, EC, Temperature). This telemetry is inherently <strong>non-personal</strong> and is aggregated for public safety and municipal reporting.</p>

          <h3>3. Personal Data Collected</h3>
          <p>When you interact with our public portal, we may collect:</p>
          <ul>
            <li><strong>Contact Information:</strong> Name, email, and organization details provided via our inquiry forms.</li>
            <li><strong>Analytics & Cookies:</strong> Standard web analytics to improve dashboard usability. You may opt out via our cookie consent banner.</li>
            <li><strong>Alert Routing Data:</strong> Phone numbers and Telegram handles explicitly provided by municipal engineers to receive emergency notifications.</li>
          </ul>

          <h3>4. How We Use Your Information</h3>
          <p>We use personal data solely for:</p>
          <ul>
            <li>Dispatching automated critical alerts to designated municipal personnel.</li>
            <li>Responding to deployment inquiries and support requests.</li>
            <li>Maintaining the security and stability of the SagarDrishti API.</li>
          </ul>

          <h3>5. Data Security</h3>
          <p>All telemetry and personal alert data are stored in secure PostgreSQL databases. Traffic is encrypted via TLS 1.3. We do not sell or share contact information with third-party advertisers under any circumstances.</p>

          <h3>6. Contact Us</h3>
          <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@sagardrishti.org">privacy&#64;sagardrishti.org</a>.</p>
        </div>
      </div>
    </div>
  `
})
export class PrivacyComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: 'Privacy Policy',
      description: 'Project SagarDrishti Privacy Policy detailing GDPR and DPDP compliance regarding telemetry data and user information.',
      canonicalUrl: 'https://sagardrishti.org/privacy'
    });
  }
}
