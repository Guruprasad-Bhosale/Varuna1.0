import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../core/services/seo.service';
import { BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-case-studies',
  standalone: true,
  imports: [CommonModule, BreadcrumbsComponent],
  template: `
    <div id="deployments" class="py-12 md:py-20 scroll-mt-24">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <app-breadcrumbs [crumbs]="[{label: 'Deployments & Case Studies', path: '/case-studies'}]"></app-breadcrumbs>
        
        <h1 class="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 uppercase highlighter-amber inline-block">Field Deployments</h1>
        <p class="text-xl font-bold text-slate-700 mb-12 border-l-4 border-slate-900 pl-4 py-1">Real-world impact of automated river monitoring.</p>

        <!-- Case Study 1 -->
        <div class="stamp-card bg-white p-8 md:p-12 mb-16 relative">
          <div class="washi-tape-top"></div>
          <div class="absolute top-6 right-6">
            <span class="rubber-stamp-resolved">RESOLVED</span>
          </div>
          
          <div class="inline-flex items-center px-3 py-1 bg-slate-900 text-white font-mono text-[10px] font-black uppercase tracking-widest mb-6">Pilot Program // 01</div>
          <h2 class="text-3xl font-black text-slate-900 mb-6 uppercase tracking-wider">Panchaganga River Pilot (Kolhapur)</h2>
          
          <p class="text-lg font-medium text-slate-700 mb-8 border-l-4 border-slate-200 pl-4">
            The Panchaganga river basin faces significant stress from localized industrial effluents and urban inflow. 
            Manual sampling occurred bi-weekly, completely missing illicit nighttime discharges.
          </p>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div class="stamp-card bg-slate-50 p-6 text-center transform -rotate-1 hover:rotate-0">
              <div class="text-3xl font-black text-slate-900 mb-1">20m</div>
              <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sampling Cycle</div>
            </div>
            <div class="stamp-card bg-slate-50 p-6 text-center transform rotate-1 hover:rotate-0">
              <div class="text-3xl font-black text-slate-900 mb-1">99.8%</div>
              <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hardware Uptime</div>
            </div>
            <div class="stamp-card bg-slate-50 p-6 text-center transform -rotate-1 hover:rotate-0">
              <div class="text-3xl font-black text-slate-900 mb-1">14</div>
              <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Critical Dispatches</div>
            </div>
          </div>

          <div class="prose prose-lg max-w-none prose-slate prose-headings:font-black prose-headings:text-slate-900 prose-headings:uppercase prose-headings:tracking-widest">
            <h3>The Intervention</h3>
            <p class="font-medium">Deployment of a VARUNA Edge Node equipped with optical turbidity sensing, pH, and a localized Pi Camera v3 screener. The system successfully identified a recurrent anomaly in turbidity and pH levels between 2:00 AM and 4:00 AM, allowing municipal engineers to trace the source to an upstream manufacturing outfall.</p>
          </div>
        </div>
          
        <!-- Interactive Before/After Visualizer Simulation -->
        <div class="stamp-card p-6 md:p-10 bg-slate-100 relative">
          <div class="absolute -top-3 -left-3 w-8 h-8 border-t-4 border-l-4 border-slate-900 z-10"></div>
          <div class="absolute -top-3 -right-3 w-8 h-8 border-t-4 border-r-4 border-slate-900 z-10"></div>
          <div class="absolute -bottom-3 -left-3 w-8 h-8 border-b-4 border-l-4 border-slate-900 z-10"></div>
          <div class="absolute -bottom-3 -right-3 w-8 h-8 border-b-4 border-r-4 border-slate-900 z-10"></div>
          
          <h3 class="font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2 border-b-2 border-slate-900 pb-2">
            <span class="w-2 h-2 rounded-full bg-rose-500"></span>
            Visual Impact Simulation
          </h3>
          
          <div class="relative w-full h-64 md:h-96 bg-slate-800 border-4 border-slate-900 shadow-[6px_6px_0px_0px_#0f172a] cursor-ew-resize select-none overflow-hidden"
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
              <div class="absolute top-4 left-4 rubber-stamp-dispatched">Before (High Turbidity)</div>
            </div>

            <!-- AFTER IMAGE -->
            <div class="absolute inset-y-0 left-0 bg-[url('https://images.unsplash.com/photo-1590077428593-a55bb07c4665?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center border-r-4 border-white shadow-[2px_0_10px_rgba(0,0,0,0.5)]"
                 [style.width.%]="sliderPosition">
              <div class="absolute inset-0 bg-cyan-900/20"></div>
              <div class="absolute top-4 left-4 rubber-stamp-resolved whitespace-nowrap">After Monitoring</div>
            </div>

            <!-- Slider Handle -->
            <div class="absolute inset-y-0 flex items-center justify-center pointer-events-none transform -translate-x-1/2"
                 [style.left.%]="sliderPosition">
              <div class="w-10 h-10 bg-white border-2 border-slate-900 rounded-full shadow-[2px_2px_0px_0px_#0f172a] flex items-center justify-center text-slate-900 pointer-events-auto">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
              </div>
            </div>
          </div>
          <p class="text-center font-mono font-bold text-[10px] text-slate-500 uppercase tracking-widest mt-6">Drag slider to compare simulated visual river quality improvements</p>
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
