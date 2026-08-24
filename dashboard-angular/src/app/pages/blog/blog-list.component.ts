import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterModule, BreadcrumbsComponent],
  template: `
    <div class="py-12 md:py-20 min-h-screen bg-slate-50">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <app-breadcrumbs [crumbs]="[{label: 'Technical Blog', path: '/blog'}]"></app-breadcrumbs>
        
        <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Technical Insights</h1>
        <p class="text-xl font-medium text-slate-700 mb-12">Deep dives into the architecture, ML models, and hardware engineering powering Project SagarDrishti.</p>

        <div class="space-y-8">
          <article *ngFor="let post of posts" class="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:border-slate-300 hover:shadow-md transition-all">
            <div class="flex items-center space-x-3 text-xs font-semibold text-slate-500 mb-3">
              <span class="bg-slate-100 px-2.5 py-1 rounded-md text-slate-700">{{ post.date }}</span>
              <span>&bull;</span>
              <span class="text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">{{ post.category }}</span>
            </div>
            
            <h2 class="text-2xl font-bold text-slate-900 mb-3 hover:text-teal-600 transition leading-snug">
              <a [routerLink]="'/blog/' + post.slug">{{ post.title }}</a>
            </h2>
            
            <p class="text-base font-normal text-slate-700 mb-6 leading-relaxed">{{ post.excerpt }}</p>
            
            <div class="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
              <div class="text-xs font-bold text-slate-700">
                Guruprasad Bhosale <span class="text-slate-400 font-normal">| Lead Architect</span>
              </div>
              <a [routerLink]="'/blog/' + post.slug" class="inline-flex items-center text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors">
                Read Article <svg class="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </a>
            </div>
          </article>
        </div>
      </div>
    </div>
  `
})
export class BlogListComponent implements OnInit {
  posts = [
    {
      slug: 'automated-vs-manual-grab-sampling',
      title: 'Automated River Monitoring vs. Manual Grab Sampling: Why Latency Kills Ecosystems.',
      excerpt: 'Analyzing the 72-hour delay inherent in traditional laboratory analysis and how continuous IoT telemetry prevents downstream ecological disasters.',
      date: 'Aug 10, 2026',
      category: 'Environmental Science'
    },
    {
      slug: 'edge-ai-raspberry-pi-random-forests',
      title: 'Edge AI on Raspberry Pi 4: Sub-Second Water Safety Inference with Random Forests.',
      excerpt: 'How we transitioned from cloud-based inference to local Edge ML execution, achieving 500ms latency while operating on a strict solar power budget.',
      date: 'Aug 02, 2026',
      category: 'Machine Learning'
    },
    {
      slug: 'computer-vision-turbid-waters',
      title: 'Computer Vision in Turbid Waters: Morphological Contour Screening for Particulates.',
      excerpt: 'A technical breakdown of our OpenCV pipeline used to dynamically extract and measure micro-debris from Pi Camera HDR frames.',
      date: 'Jul 24, 2026',
      category: 'Computer Vision'
    },
    {
      slug: 'architecting-resilient-iot-telemetry',
      title: 'Architecting Resilient IoT Telemetry with Offline SQLite Buffering and Cloud Sync.',
      excerpt: 'Handling network dropouts in remote river basins. We explore our local SQLite buffer strategy and robust MQTT payload synchronization.',
      date: 'Jul 15, 2026',
      category: 'IoT Systems'
    },
    {
      slug: 'understanding-cpcb-wqi-standards',
      title: 'Understanding CPCB Standards: How to Compute Composite Water Quality Indices (WQI).',
      excerpt: 'Demystifying the math behind the Water Quality Index (WQI). How SagarDrishti maps raw telemetry values against India\'s CPCB normative standards.',
      date: 'Jul 01, 2026',
      category: 'Data Engineering'
    }
  ];

  constructor(private seoService: SeoService) {}

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: 'Technical Blog | Engineering Insights',
      description: 'Deep dives into the IoT hardware, Edge AI models, and environmental science powering Project SagarDrishti.',
      canonicalUrl: 'https://sagardrishti.org/blog'
    });
  }
}

