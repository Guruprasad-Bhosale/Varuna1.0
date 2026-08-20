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
              <div class="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mr-2">
                <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <span class="font-bold text-lg tracking-tight text-white">Project VARUNA</span>
            </div>
            <p class="text-sm max-w-sm mb-6 text-slate-500">
              Combating delayed manual river sampling with automated IoT nodes, Edge AI intelligence, and real-time environmental telemetry.
            </p>
            <div class="flex space-x-4">
              <a href="https://github.com/Guruprasad-Bhosale/Varuna1.0" target="_blank" class="text-slate-500 hover:text-white transition">
                <span class="sr-only">GitHub</span>
                <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" /></svg>
              </a>
            </div>
            
            <div class="mt-6 inline-flex items-center px-3 py-1.5 rounded bg-slate-900 border border-slate-800">
              <span class="flex h-2 w-2 relative mr-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span class="text-xs font-semibold text-slate-300">SLA: 20m cycle, < 3s alert dispatch</span>
            </div>
          </div>
          
          <div>
            <h3 class="text-sm font-semibold text-white tracking-wider uppercase mb-4">Technology</h3>
            <ul class="space-y-3 text-sm">
              <li><a routerLink="/features/iot-hardware-node" class="hover:text-white transition">Hardware Nodes</a></li>
              <li><a routerLink="/features/edge-ai-classification" class="hover:text-white transition">Edge AI Inference</a></li>
              <li><a routerLink="/features/optical-particle-screener" class="hover:text-white transition">Optical Screening</a></li>
              <li><a routerLink="/features/automated-alert-gateway" class="hover:text-white transition">Alert Gateway</a></li>
              <li><a href="/public/llms.txt" target="_blank" class="hover:text-white transition">AI Manifest (llms.txt)</a></li>
            </ul>
          </div>
          
          <div>
            <h3 class="text-sm font-semibold text-white tracking-wider uppercase mb-4">Organization</h3>
            <ul class="space-y-3 text-sm">
              <li><a routerLink="/about" class="hover:text-white transition">Our Mission</a></li>
              <li><a routerLink="/case-studies" class="hover:text-white transition">Case Studies</a></li>
              <li><a routerLink="/blog" class="hover:text-white transition">Technical Blog</a></li>
              <li><a routerLink="/faq" class="hover:text-white transition">FAQ</a></li>
              <li><a routerLink="/contact" class="hover:text-white transition">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div class="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs">
          <p>&copy; 2026 Project VARUNA Environmental Intelligence. All rights reserved.</p>
          <div class="flex space-x-6 mt-4 md:mt-0">
            <a routerLink="/privacy" class="hover:text-white transition">Privacy Policy</a>
            <a routerLink="/terms" class="hover:text-white transition">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class PublicFooterComponent {}
