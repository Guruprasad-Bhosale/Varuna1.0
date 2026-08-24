import { Component, signal, computed, inject, HostListener, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-global-search',
  standalone: true,
  template: `
    <div class="relative w-full max-w-md">
      <!-- Search Input -->
      <div class="relative flex items-center">
        <svg class="absolute left-3 h-4 w-4 text-slate-400 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          type="text" 
          [value]="searchQuery()" 
          (input)="updateSearch($event)" 
          (keydown.enter)="onEnterPressed()"
          (keydown.escape)="showDropdown.set(false)"
          placeholder="Search nodes, locations..." 
          class="w-full pl-9 pr-4 py-2 bg-slate-50 border-2 border-slate-900 rounded-xl font-mono text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-[2px_2px_0px_0px_#0f172a] transition-all"
        />
      </div>

      <!-- Autocomplete Dropdown -->
      @if (showDropdown() && filteredNodes().length > 0) {
        <div class="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_#0f172a] overflow-hidden z-[1000] contain-layout">
          <ul class="max-h-64 overflow-y-auto">
            @for (node of filteredNodes(); track node.id) {
              <li>
                <button (click)="selectNode(node.id)" class="w-full text-left px-4 py-3 hover:bg-teal-50 border-b border-slate-100 last:border-0 transition-colors flex flex-col">
                  <span class="font-black text-slate-900 text-sm">{{ node.id }}</span>
                  <span class="font-mono text-xs font-bold text-slate-500">{{ node.location }}</span>
                </button>
              </li>
            }
          </ul>
        </div>
      }
    </div>
  `
})
export class GlobalSearchComponent {
  private router = inject(Router);
  private elementRef = inject(ElementRef);
  
  searchQuery = signal('');
  showDropdown = signal(false);

  // Mock registry (integrate with TelemetryService in production)
  private registry = [
    { id: 'SagarDrishti-001', location: 'Sarjekot Estuary, Panchaganga Outfall', keywords: ['node', 'sagardrishti'] },
    { id: 'SagarDrishti-002', location: 'Kasal Basin, Gad River Upstream', keywords: ['node', 'sagardrishti'] },
    { id: 'SagarDrishti-003', location: 'Kudal Bridge, Karli Central', keywords: ['node', 'sagardrishti'] },
    { id: 'SagarDrishti-004', location: 'Devbag Creek, Karli Mouth', keywords: ['node', 'sagardrishti'] }
  ];

  filteredNodes = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return [];
    return this.registry.filter(n => 
      n.id.toLowerCase().includes(query) || 
      n.location.toLowerCase().includes(query) ||
      n.keywords.some(k => k.includes(query))
    );
  });

  updateSearch(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
    this.showDropdown.set(val.trim().length > 0);
  }

  onEnterPressed() {
    const query = this.searchQuery().trim();
    this.showDropdown.set(false);
    this.searchQuery.set('');
    // Route to the master node list when Enter is pressed without selection, pass query param
    this.router.navigate(['/nodes'], { queryParams: query ? { q: query } : {} });
  }

  selectNode(nodeId: string) {
    this.showDropdown.set(false);
    this.searchQuery.set('');
    // Route directly to the live dashboard overview for this node
    this.router.navigate(['/dashboard'], { queryParams: { node: nodeId } });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showDropdown.set(false);
    }
  }
}
