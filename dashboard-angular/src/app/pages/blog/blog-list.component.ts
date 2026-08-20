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
    <div class="bg-slate-50 py-12 md:py-20 min-h-screen">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <app-breadcrumbs [crumbs]="[{label: 'Technical Blog', path: '/blog'}]"></app-breadcrumbs>
        
        <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Technical Insights</h1>
        <p class="text-xl text-slate-600 mb-12">Deep dives into the architecture, ML models, and hardware engineering powering Project VARUNA.</p>

        <div class="space-y-8">
          <article *ngFor="let post of posts" class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div class="flex items-center space-x-2 text-sm text-slate-500 mb-3 font-medium">
              <span>{{ post.date }}</span>
              <span>&bull;</span>
              <span class="text-cyan-600">{{ post.category }}</span>
            </div>
            <h2 class="text-2xl font-bold text-slate-900 mb-3 hover:text-cyan-600 transition">
              <a [routerLink]="'/blog/' + post.slug">{{ post.title }}</a>
            </h2>
            <p class="text-slate-600 mb-5">{{ post.excerpt }}</p>
            <a [routerLink]="'/blog/' + post.slug" class="inline-flex items-center text-sm font-bold text-cyan-600 hover:text-cyan-700">
              Read article <svg class="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </a>
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
      excerpt: 'Demystifying the math behind the Water Quality Index (WQI). How VARUNA maps raw telemetry values against India\'s CPCB normative standards.',
      date: 'Jul 01, 2026',
      category: 'Data Engineering'
    }
  ];

  constructor(private seoService: SeoService) {}

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: 'Technical Blog | Engineering Insights',
      description: 'Deep dives into the IoT hardware, Edge AI models, and environmental science powering Project VARUNA.',
      canonicalUrl: 'https://varuna-iot.org/blog'
    });
  }
}
