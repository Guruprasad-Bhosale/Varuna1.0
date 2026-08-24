import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../core/services/seo.service';
import { BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, BreadcrumbsComponent],
  template: `
    <div class="bg-white py-12 md:py-20 min-h-screen">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <app-breadcrumbs [crumbs]="[{label: 'Terms of Service', path: '/terms'}]"></app-breadcrumbs>
        
        <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Terms of Service</h1>
        <p class="text-sm text-slate-500 mb-12">Last Updated: August 19, 2026</p>

        <div class="prose prose-cyan text-slate-600 max-w-none">
          <h3>1. Acceptance of Terms</h3>
          <p>By accessing the Project SagarDrishti dashboard, deploying our IoT hardware nodes, or utilizing our APIs, you agree to be bound by these Terms of Service.</p>

          <h3>2. Platform Usage & API Rate Limits</h3>
          <p>SagarDrishti provides open access to environmental telemetry for authorized municipal and research partners. You agree to respect our API rate limits (100 requests per minute per IP for public endpoints). Attempting to scrape or overwhelm the REST/MQTT brokers will result in immediate API key revocation.</p>

          <h3>3. Hardware Liability & Environmental Hazards</h3>
          <p>While SagarDrishti nodes are built for resilient off-grid operation (IP67), river environments are volatile. We are not liable for hardware loss due to extreme flooding events, severe biofouling neglect, or vandalism. Regular maintenance of the optical and electrochemical sensors is the responsibility of the deployment partner unless a managed SLA is explicitly signed.</p>

          <h3>4. Alert Latency & Service Guarantees</h3>
          <p>We strive for &lt; 3-second alert dispatch latency. However, reliance on third-party cellular networks (4G/LTE) and external API gateways (WhatsApp Cloud API) means 100% uptime cannot be legally guaranteed. SagarDrishti is a supplemental intelligence system and should not replace emergency manual protocols.</p>

          <h3>5. Intellectual Property</h3>
          <p>The Edge AI Random Forest models, OpenCV morphological screening pipelines, and the Angular dashboard architecture remain the intellectual property of Project SagarDrishti. You may not reverse-engineer the ESP32 state machines or edge Python scripts without explicit open-source licensing agreements.</p>
        </div>
      </div>
    </div>
  `
})
export class TermsComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: 'Terms of Service',
      description: 'Terms of Service and SLA agreements for deploying Project SagarDrishti hardware nodes and APIs.',
      canonicalUrl: 'https://sagardrishti.org/terms'
    });
  }
}
