import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../core/services/seo.service';
import { BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-case-studies',
  standalone: true,
  imports: [CommonModule, BreadcrumbsComponent],
  template: `
    <div class="bg-white py-12 md:py-20">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <app-breadcrumbs [crumbs]="[{label: 'Deployments & Case Studies', path: '/case-studies'}]"></app-breadcrumbs>
        
        <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Field Deployments</h1>
        <p class="text-xl text-slate-600 mb-12">Real-world impact of automated river monitoring.</p>

        <!-- Case Study 1 -->
        <div class="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden mb-12 shadow-sm">
          <div class="p-8 md:p-12">
            <div class="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">Pilot Program</div>
            <h2 class="text-3xl font-bold text-slate-900 mb-4">Panchaganga River Pilot (Kolhapur)</h2>
            <p class="text-lg text-slate-600 mb-8">
              The Panchaganga river basin faces significant stress from localized industrial effluents and urban inflow. 
              Manual sampling occurred bi-weekly, completely missing illicit nighttime discharges.
            </p>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
                <div class="text-3xl font-extrabold text-cyan-600">20m</div>
                <div class="text-sm font-medium text-slate-500 uppercase tracking-wide mt-1">Sampling Frequency</div>
              </div>
              <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
                <div class="text-3xl font-extrabold text-emerald-600">99.8%</div>
                <div class="text-sm font-medium text-slate-500 uppercase tracking-wide mt-1">Uptime</div>
              </div>
              <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
                <div class="text-3xl font-extrabold text-rose-600">14</div>
                <div class="text-sm font-medium text-slate-500 uppercase tracking-wide mt-1">Critical Alerts</div>
              </div>
            </div>

            <div class="prose prose-cyan max-w-none text-slate-600">
              <h3>The Intervention</h3>
              <p>Deployment of a VARUNA Edge Node equipped with optical turbidity sensing, pH, and a localized Pi Camera v3 screener. The system successfully identified a recurrent anomaly in turbidity and pH levels between 2:00 AM and 4:00 AM, allowing municipal engineers to trace the source to an upstream manufacturing outfall.</p>
            </div>
          </div>
          
          <!-- Interactive Before/After Visualizer Simulation -->
          <div class="bg-slate-900 p-8 text-white relative">
            <h3 class="font-bold text-xl mb-6 flex items-center">
              <svg class="w-5 h-5 text-cyan-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              Impact Visualizer: Before vs After Intervention
            </h3>
            
            <div class="relative w-full h-64 md:h-96 bg-slate-800 rounded-xl overflow-hidden border-2 border-slate-700 cursor-ew-resize select-none"
                 (mousemove)="onDrag($event)" 
                 (touchmove)="onTouchDrag($event)"
                 (mouseleave)="isDragging = false"
                 (mouseup)="isDragging = false"
                 (mousedown)="isDragging = true"
                 (touchstart)="isDragging = true"
                 (touchend)="isDragging = false">
                 
              <!-- BEFORE IMAGE (Simulated with CSS) -->
              <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1590077428593-a55bb07c4665?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center">
                <div class="absolute inset-0 bg-yellow-900/60 mix-blend-multiply"></div>
                <div class="absolute top-4 left-4 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded shadow-lg">Before Intervention (High Turbidity)</div>
              </div>

              <!-- AFTER IMAGE -->
              <div class="absolute inset-y-0 left-0 bg-[url('https://images.unsplash.com/photo-1590077428593-a55bb07c4665?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center border-r-4 border-white shadow-[2px_0_10px_rgba(0,0,0,0.5)]"
                   [style.width.%]="sliderPosition">
                <div class="absolute inset-0 bg-cyan-900/20"></div>
                <div class="absolute top-4 left-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded shadow-lg whitespace-nowrap">After Monitoring & Enforcement</div>
              </div>

              <!-- Slider Handle -->
              <div class="absolute inset-y-0 flex items-center justify-center pointer-events-none transform -translate-x-1/2"
                   [style.left.%]="sliderPosition">
                <div class="w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center text-slate-900 pointer-events-auto">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
                </div>
              </div>
            </div>
            <p class="text-center text-slate-400 text-xs mt-4">Drag slider to compare simulated visual river quality improvements.</p>
          </div>
        </div>

      </div>
    </div>
  `
})
export class CaseStudiesComponent implements OnInit {
  sliderPosition = 50;
  isDragging = false;

  constructor(private seoService: SeoService) {}

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: 'Deployments & Case Studies',
      description: 'Review real-world deployments of Project VARUNA, including the Panchaganga River Pilot and urban inflow monitoring.',
      canonicalUrl: 'https://varuna-iot.org/case-studies'
    });
  }

  onDrag(event: MouseEvent) {
    if (!this.isDragging) return;
    this.updateSliderPosition(event.clientX, event.currentTarget as HTMLElement);
  }

  onTouchDrag(event: TouchEvent) {
    if (!this.isDragging) return;
    this.updateSliderPosition(event.touches[0].clientX, event.currentTarget as HTMLElement);
  }

  private updateSliderPosition(clientX: number, container: HTMLElement) {
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    this.sliderPosition = percent;
  }
}
