import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="flex text-sm text-slate-500 mb-6" aria-label="Breadcrumb">
      <ol class="inline-flex items-center space-x-1 md:space-x-3">
        <li class="inline-flex items-center">
          <a routerLink="/" class="inline-flex items-center hover:text-slate-800 transition">
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
            Home
          </a>
        </li>
        <li *ngFor="let crumb of crumbs; let isLast = last">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
            <a *ngIf="!isLast" [routerLink]="crumb.path" class="ml-1 md:ml-2 hover:text-slate-800 transition">{{ crumb.label }}</a>
            <span *ngIf="isLast" class="ml-1 md:ml-2 text-slate-700 font-medium" aria-current="page">{{ crumb.label }}</span>
          </div>
        </li>
      </ol>
    </nav>
  `
})
export class BreadcrumbsComponent {
  @Input() crumbs: { label: string, path: string }[] = [];
}
