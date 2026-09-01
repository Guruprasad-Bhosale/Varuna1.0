import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../core/services/seo.service';
import { BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-case-studies',
  standalone: true,
  imports: [CommonModule, BreadcrumbsComponent],
  template: `
    <div id="deployments" class="py-12 md:py-20 scroll-mt-24 bg-slate-50 min-h-screen">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <app-breadcrumbs [crumbs]="[{label: 'Deployments & Case Studies', path: '/case-studies'}]"></app-breadcrumbs>
        
        <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Field Deployments</h1>
        <p class="text-xl font-medium text-slate-700 mb-12">Real-world impact of automated river monitoring across active Indian river basins.</p>

        <!-- Case Study 1 -->
        <div class="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 mb-12 shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div class="inline-flex items-center px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 font-bold text-xs rounded-full uppercase tracking-wider">
              Pilot Program • 01
            </div>
            <span class="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider">
              Active Deployment
            </span>
          </div>
          
          <h2 class="text-3xl font-bold text-slate-900 mb-6">Gad River Basin Pilot (Sarjekot Estuary)</h2>
          
          <p class="text-lg font-medium text-slate-700 mb-8 border-l-4 border-teal-600 pl-4 leading-relaxed">
            The Gad River basin faces critical stress from localized industrial effluents and estuary outfall surges. 
            Manual sampling occurred bi-weekly, completely missing illicit nighttime discharges.
          </p>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center shadow-sm">
              <div class="text-3xl font-black text-slate-900 mb-1">20m</div>
              <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">Sampling Cycle</div>
            </div>
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center shadow-sm">
              <div class="text-3xl font-black text-slate-900 mb-1">99.8%</div>
              <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">Hardware Uptime</div>
            </div>
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center shadow-sm">
              <div class="text-3xl font-black text-slate-900 mb-1">14</div>
              <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">Critical Dispatches</div>
            </div>
          </div>

          <div class="space-y-3 text-slate-700 text-base leading-relaxed border-t border-slate-100 pt-6">
            <h3 class="text-lg font-bold text-slate-900">The Intervention</h3>
            <p>Deployment of a SagarDrishti Edge Node equipped with optical turbidity sensing, pH, and a localized Pi Camera v3 screener. The system successfully identified a recurrent anomaly in turbidity and pH levels between 2:00 AM and 4:00 AM, allowing municipal engineers to trace the source to an upstream manufacturing outfall.</p>
          </div>
        </div>
          
        <!-- Interactive Before/After Visualizer Simulation -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 md:p-10 shadow-sm">
          <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
              Visual Impact Comparison
            </h3>
            <span class="text-xs text-slate-500 font-medium">Turbidity Remediation</span>
          </div>
          
          <div class="relative w-full h-64 md:h-96 rounded-xl bg-slate-800 shadow-inner cursor-ew-resize select-none overflow-hidden"
               (mousemove)="onDrag($event)" 
               (touchmove)="onTouchDrag($event)"
               (mouseleave)="isDragging = false"
               (mouseup)="isDragging = false"
               (mousedown)="isDragging = true"
               (touchstart)="isDragging = true"
               (touchend)="isDragging = false">
               
            <!-- BEFORE IMAGE -->
            <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1590077428593-a55bb07c4665?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center">
              <div class="absolute inset-0 bg-yellow-900/60 mix-blend-multiply"></div>
              <div class="absolute top-4 left-4 bg-rose-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow">
                Before Monitoring (High Turbidity)
              </div>
            </div>

            <!-- AFTER IMAGE -->
            <div class="absolute inset-y-0 left-0 bg-[url('https://images.unsplash.com/photo-1590077428593-a55bb07c4665?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center border-r-2 border-white shadow-2xl"
                 [style.width.%]="sliderPosition">
              <div class="absolute inset-0 bg-cyan-900/20"></div>
              <div class="absolute top-4 left-4 bg-emerald-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow whitespace-nowrap">
                After Automated Governance
              </div>
            </div>

            <!-- Slider Handle -->
            <div class="absolute inset-y-0 flex items-center justify-center pointer-events-none transform -translate-x-1/2"
                 [style.left.%]="sliderPosition">
              <div class="w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-800 border border-slate-200 pointer-events-auto">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
              </div>
            </div>
          </div>
          <p class="text-center text-xs font-semibold text-slate-500 mt-4">Drag slider to compare simulated visual river quality improvements</p>
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
      title: 'Deployments & Case Studies | Project SagarDrishti',
      description: 'Review real-world deployments of Project SagarDrishti, including the Gad River Basin Pilot (Sarjekot Estuary) and coastal outfall monitoring.',
      canonicalUrl: 'https://sagardrishti.org/case-studies'
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

