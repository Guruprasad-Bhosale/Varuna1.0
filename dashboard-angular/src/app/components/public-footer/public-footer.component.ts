import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 pb-24 md:pb-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div class="col-span-1 md:col-span-2">
            <div class="flex items-center mb-4">
              <div class="w-7 h-7 rounded-lg bg-teal-600 border border-slate-700 flex items-center justify-center mr-3 shadow-sm">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <span class="font-black text-lg tracking-tight text-white uppercase">Project SagarDrishti — River Intelligence Platform</span>
            </div>
            <p class="text-sm max-w-sm mb-6 text-slate-300 leading-relaxed font-medium">
              Real-time IoT edge telemetry, optical particulate flow analysis, and predictive bio-optical bloom forecasting across the Sindhudurg Basin.
            </p>
            
            <div class="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <span class="flex h-2 w-2 relative mr-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span class="text-xs font-semibold text-slate-300 font-mono">SLA: 20m cycle, &lt; 3s alert dispatch</span>
            </div>
          </div>
          
          <div>
            <h3 class="text-sm font-bold text-white tracking-wider uppercase mb-4">Technology</h3>
            <ul class="space-y-3 text-sm font-medium">
              <li><a routerLink="/features/iot-hardware-node" class="hover:text-white transition-colors">Hardware Nodes</a></li>
              <li><a routerLink="/features/edge-ai-classification" class="hover:text-white transition-colors">Edge AI Inference</a></li>
              <li><a routerLink="/features/optical-particle-screener" class="hover:text-white transition-colors">Optical Screening</a></li>
              <li><a routerLink="/features/automated-alert-gateway" class="hover:text-white transition-colors">Alert Gateway</a></li>
              <li><a href="/public/llms.txt" target="_blank" class="hover:text-white transition-colors">AI Manifest (llms.txt)</a></li>
            </ul>
          </div>
          
          <div>
            <h3 class="text-sm font-bold text-white tracking-wider uppercase mb-4">Organization</h3>
            <ul class="space-y-3 text-sm font-medium">
              <li><a routerLink="/mission" class="hover:text-white transition-colors">Mission Storybook</a></li>
              <li><a routerLink="/about" class="hover:text-white transition-colors">Meet the Team</a></li>
              <li><a routerLink="/case-studies" class="hover:text-white transition-colors">Case Studies</a></li>
              <li><a routerLink="/blog" class="hover:text-white transition-colors">Technical Blog</a></li>
              <li><a routerLink="/faq" class="hover:text-white transition-colors">FAQ</a></li>
              <li><a routerLink="/contact" class="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div class="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs">
          <p class="text-slate-400 font-medium">&copy; 2026 Project SagarDrishti Environmental Intelligence. All rights reserved.</p>
          <div class="flex space-x-6 mt-4 md:mt-0">
            <a routerLink="/privacy" class="text-slate-400 hover:text-white transition-colors">Privacy Policy</a>
            <a routerLink="/terms" class="text-slate-400 hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class PublicFooterComponent {}

