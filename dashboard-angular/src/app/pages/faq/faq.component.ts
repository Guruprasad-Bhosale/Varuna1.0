import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../core/services/seo.service';
import { BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, BreadcrumbsComponent],
  template: `
    <div class="bg-white py-12 md:py-20 min-h-screen">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <app-breadcrumbs [crumbs]="[{label: 'Frequently Asked Questions', path: '/faq'}]"></app-breadcrumbs>
        
        <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Frequently Asked Questions</h1>
        <p class="text-xl text-slate-600 mb-12">Technical details regarding node deployment, maintenance, and alerts.</p>

        <div class="space-y-4">
          <div *ngFor="let faq of faqs; let i = index" class="border border-slate-200 rounded-xl overflow-hidden">
            <button 
              (click)="toggle(i)" 
              class="w-full text-left px-6 py-4 bg-slate-50 hover:bg-slate-100 flex justify-between items-center focus:outline-none transition-colors"
            >
              <span class="font-bold text-slate-900">{{ faq.question }}</span>
              <svg class="w-5 h-5 text-slate-500 transform transition-transform duration-200" 
                   [class.rotate-180]="activeIndex === i" 
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <div *ngIf="activeIndex === i" class="px-6 py-4 bg-white border-t border-slate-200">
              <p class="text-slate-600 leading-relaxed">{{ faq.answer }}</p>
            </div>
          </div>
        </div>
        
        <div class="mt-16 p-8 bg-cyan-50 rounded-2xl border border-cyan-100 text-center">
          <h3 class="text-xl font-bold text-cyan-900 mb-2">Still have questions?</h3>
          <p class="text-cyan-700 mb-6">Our environmental engineering team is here to help you evaluate your basin's needs.</p>
          <a href="/contact" class="inline-flex justify-center items-center px-6 py-3 border border-transparent text-sm font-bold rounded-lg text-white bg-cyan-600 hover:bg-cyan-500 transition-colors">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  `
})
export class FaqComponent implements OnInit {
  activeIndex: number | null = 0;

  faqs = [
    {
      question: "How long can a SagarDrishti node operate off-grid?",
      answer: "The hardware node is equipped with a 12V 7Ah SLA battery paired with a 20W monocrystalline solar panel. With a standard 20-minute sampling cycle, the system can operate autonomously indefinitely, with up to 5 days of reserve power during heavy monsoon cloud cover."
    },
    {
      question: "What is the maintenance cycle for the sensors (biofouling)?",
      answer: "We utilize an automated hydraulic flushing routine inside the sampling chamber. However, industrial glass pH electrodes and optical sensors still require physical cleaning and 2-point buffer calibration every 4 to 6 weeks, depending on the severity of river biofouling and silt load."
    },
    {
      question: "What happens to the data if the 4G network drops?",
      answer: "Resilience is built-in. If the edge gateway loses cellular connectivity, all telemetry is buffered locally into an SQLite database on the Raspberry Pi. Once the connection is re-established, an asynchronous worker bulk-syncs the historical payloads via MQTT to the cloud."
    },
    {
      question: "How fast is the emergency alert latency?",
      answer: "Our Service Level Agreement (SLA) guarantees that once the Edge AI Random Forest model flags a 'Dangerous' sub-index WQI, the emergency payload is transmitted via HTTP webhooks, triggering WhatsApp and SMS alerts to municipal authorities in under 3 seconds."
    },
    {
      question: "Can we integrate this data into our existing Municipal GIS systems?",
      answer: "Yes. SagarDrishti provides secure, authenticated REST APIs to extract live JSON payloads. We also support direct webhook forwarding to push real-time geospatial telemetry directly into Esri ArcGIS or custom Leaflet deployments used by city command centers."
    }
  ];

  constructor(private seoService: SeoService) {}

  ngOnInit() {
    // Build JSON-LD FAQ Schema
    const schemaJson = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": this.faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };

    this.seoService.updateMetaTags({
      title: 'Frequently Asked Questions',
      description: 'Technical FAQs regarding Project SagarDrishti node deployment, off-grid power autonomy, sensor maintenance, and API integrations.',
      canonicalUrl: 'https://sagardrishti.org/faq',
      schemaJson
    });
  }

  toggle(index: number) {
    this.activeIndex = this.activeIndex === index ? null : index;
  }
}
