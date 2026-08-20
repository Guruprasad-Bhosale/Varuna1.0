import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, BreadcrumbsComponent],
  template: `
    <div class="bg-white py-12 md:py-20" *ngIf="post">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <app-breadcrumbs [crumbs]="[
          {label: 'Blog', path: '/blog'},
          {label: post.title, path: '/blog/' + post.slug}
        ]"></app-breadcrumbs>
        
        <div class="mb-8">
          <div class="flex items-center space-x-2 text-sm text-slate-500 mb-4 font-medium">
            <span>{{ post.date }}</span>
            <span>&bull;</span>
            <span class="text-cyan-600">{{ post.category }}</span>
          </div>
          <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">{{ post.title }}</h1>
        </div>

        <div class="prose prose-lg prose-cyan text-slate-700 max-w-none">
          <p class="lead">{{ post.excerpt }}</p>
          <div [innerHTML]="post.content"></div>
        </div>
        
        <div class="mt-16 pt-8 border-t border-slate-200">
          <a routerLink="/blog" class="text-cyan-600 hover:underline font-medium">&larr; Back to all articles</a>
        </div>
      </div>
    </div>
    
    <div class="bg-white py-20 text-center" *ngIf="!post">
      <h2 class="text-2xl font-bold text-slate-900">Article not found</h2>
      <a routerLink="/blog" class="text-cyan-600 hover:underline mt-4 inline-block">Return to Blog</a>
    </div>
  `
})
export class BlogDetailComponent implements OnInit {
  slug: string = '';
  post: any = null;

  private postsDB: Record<string, any> = {
    'automated-vs-manual-grab-sampling': {
      slug: 'automated-vs-manual-grab-sampling',
      title: 'Automated River Monitoring vs. Manual Grab Sampling: Why Latency Kills Ecosystems.',
      excerpt: 'Analyzing the 72-hour delay inherent in traditional laboratory analysis and how continuous IoT telemetry prevents downstream ecological disasters.',
      date: 'Aug 10, 2026',
      category: 'Environmental Science',
      content: `
        <p>In standard environmental compliance, technicians travel to river locations, fill sample bottles, and transport them to labs. Results take 2-3 days.</p>
        <p>By the time a high concentration of dissolved solids or an acidic pH drop is identified, the water mass has flowed miles downstream, affecting agriculture and drinking water intakes.</p>
        <h3>The VARUNA Advantage</h3>
        <p>Our autonomous nodes provide a reading every 20 minutes. This high-frequency time-series data allows us to identify spikes instantly, alerting authorities before the plume spreads.</p>
      `
    },
    'edge-ai-raspberry-pi-random-forests': {
      slug: 'edge-ai-raspberry-pi-random-forests',
      title: 'Edge AI on Raspberry Pi 4: Sub-Second Water Safety Inference with Random Forests.',
      excerpt: 'How we transitioned from cloud-based inference to local Edge ML execution, achieving 500ms latency while operating on a strict solar power budget.',
      date: 'Aug 02, 2026',
      category: 'Machine Learning',
      content: `
        <p>Sending data to the cloud for inference introduces dependency on mobile networks, which frequently drop in rural basins. Our solution: Edge AI.</p>
        <h3>Random Forest Deployment</h3>
        <p>We trained an ensemble Random Forest model on historical CPCB dataset features (pH, Turbidity, EC, Temp). We exported the model via ONNX/Scikit-learn and deployed it directly onto the Raspberry Pi 4.</p>
        <p>The result is a deterministic 500ms inference that generates a reliable Safety Score locally, deciding whether to trigger the emergency Sim800L LTE payload.</p>
      `
    },
    'computer-vision-turbid-waters': {
      slug: 'computer-vision-turbid-waters',
      title: 'Computer Vision in Turbid Waters: Morphological Contour Screening for Particulates.',
      excerpt: 'A technical breakdown of our OpenCV pipeline used to dynamically extract and measure micro-debris from Pi Camera HDR frames.',
      date: 'Jul 24, 2026',
      category: 'Computer Vision',
      content: `
        <p>Infrared turbidity sensors measure overall cloudiness, but they cannot distinguish between natural silt and hazardous micro-plastics or biological debris. We built an optical screening chamber to solve this.</p>
        <h3>OpenCV Pipeline</h3>
        <p>Using a darkfield LED array and a Pi Camera v3, we capture high-contrast images of suspended particles. We apply cv2.GaussianBlur() to reduce sensor noise, followed by an adaptive cv2.threshold(). Finally, morphological operations isolate distinct contours.</p>
        <p>By mapping pixel area to known focal lengths, we achieve sub-millimeter precision in estimating average particulate sizes.</p>
      `
    },
    'architecting-resilient-iot-telemetry': {
      slug: 'architecting-resilient-iot-telemetry',
      title: 'Architecting Resilient IoT Telemetry with Offline SQLite Buffering and Cloud Sync.',
      excerpt: 'Handling network dropouts in remote river basins. We explore our local SQLite buffer strategy and robust MQTT payload synchronization.',
      date: 'Jul 15, 2026',
      category: 'IoT Systems',
      content: `
        <p>In rural Indian river basins, 4G LTE coverage is intermittent. A "fire and forget" POST request architecture loses critical environmental data.</p>
        <h3>The Buffer Strategy</h3>
        <p>All telemetry captured by the ESP32 is first committed to a local SQLite database on the edge gateway. A background worker periodically attempts to push un-synced rows via MQTT to our cloud broker.</p>
        <p>If the network is down, the system simply queues the readings. Once connectivity is restored, it bulk-syncs the buffer with the correct historical timestamps, ensuring zero data loss.</p>
      `
    },
    'understanding-cpcb-wqi-standards': {
      slug: 'understanding-cpcb-wqi-standards',
      title: 'Understanding CPCB Standards: How to Compute Composite Water Quality Indices (WQI).',
      excerpt: 'Demystifying the math behind the Water Quality Index (WQI). How VARUNA maps raw telemetry values against India\'s CPCB normative standards.',
      date: 'Jul 01, 2026',
      category: 'Data Engineering',
      content: `
        <p>The Water Quality Index (WQI) is a single number that expresses the overall quality of water based on several parameters. The Central Pollution Control Board (CPCB) defines specific weights for different parameters based on their health impact.</p>
        <h3>Computing the Sub-Index</h3>
        <p>We normalize each sensor reading against the ideal standard. For pH, deviations from 7.0 are exponentially penalized. The final WQI is a weighted arithmetic mean of all active sensors.</p>
        <p>VARUNA dynamically computes this on the edge, presenting operators with an easy-to-understand 0-100 scale.</p>
      `
    }
  };

  constructor(
    private route: ActivatedRoute,
    private seoService: SeoService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.slug = params.get('slug') || '';
      this.post = this.postsDB[this.slug];

      if (this.post) {
        this.seoService.updateMetaTags({
          title: this.post.title,
          description: this.post.excerpt,
          canonicalUrl: `https://varuna-iot.org/blog/${this.post.slug}`
        });
      }
    });
  }
}
