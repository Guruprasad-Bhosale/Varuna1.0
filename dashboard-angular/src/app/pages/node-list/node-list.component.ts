import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-node-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-50 p-6 md:p-12 text-slate-800">
      <div class="max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-300 slide-in-from-bottom-2">
        <header class="border-b-2 border-slate-900 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 class="font-black text-3xl sm:text-4xl text-slate-900 tracking-tight uppercase">SagarDrishti Hardware Registry</h1>
            <p class="text-slate-600 font-bold mt-2 text-sm max-w-2xl">Complete catalog of deployed edge monitoring nodes across the Sindhudurg basin network.</p>
          </div>
          @if (searchQuery()) {
            <div class="bg-teal-50 border-2 border-slate-900 rounded-lg px-4 py-2 font-mono text-sm font-bold shadow-[2px_2px_0px_0px_#0f172a]">
              Filtering by: <span class="text-teal-700">"{{ searchQuery() }}"</span>
              <button (click)="clearFilter()" class="ml-2 text-slate-500 hover:text-slate-900 transition-colors">(&times; clear)</button>
            </div>
          }
        </header>

        <main>
          @if (filteredNodes().length === 0) {
            <div class="bg-white border-2 border-slate-900 rounded-xl p-12 text-center shadow-[4px_4px_0px_0px_#0f172a]">
              <p class="font-bold text-slate-500 text-lg">No hardware nodes matched the active filter.</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              @for (node of filteredNodes(); track node.id) {
                <div class="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[4px_4px_0px_0px_#0f172a] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#0f172a] transition-all flex flex-col relative overflow-hidden group">
                  <div class="flex items-start justify-between mb-4">
                    <div>
                      <div class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Node ID</div>
                      <h3 class="font-black text-lg text-slate-900">{{ node.id }}</h3>
                    </div>
                    <!-- Badge -->
                    <span 
                      class="px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-md border-2"
                      [ngClass]="node.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 border-emerald-900' : 'bg-amber-100 text-amber-800 border-amber-900'"
                    >
                      {{ node.status }}
                    </span>
                  </div>
                  
                  <div class="flex-1 space-y-4">
                    <div>
                      <div class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Location</div>
                      <div class="font-mono text-sm font-bold text-slate-700">{{ node.location }}</div>
                    </div>
                    <div>
                      <div class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Last Sync</div>
                      <div class="font-mono text-sm font-bold text-slate-700">{{ node.lastSync }}</div>
                    </div>
                  </div>

                  <div class="mt-6 pt-4 border-t-2 border-slate-100">
                    <button 
                      (click)="viewTelemetry(node.id)" 
                      class="w-full bg-slate-900 hover:bg-teal-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors shadow-[2px_2px_0px_0px_rgba(15,23,42,0.1)]"
                    >
                      View Telemetry &rarr;
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </main>
      </div>
    </div>
  `
})
export class NodeListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  searchQuery = signal('');

  private nodes = [
    { id: 'SagarDrishti-001', location: 'Sarjekot Estuary, Gad River Mouth', status: 'ACTIVE', lastSync: '2 mins ago' },
    { id: 'SagarDrishti-002', location: 'Kasal Basin, Gad River Upstream', status: 'ACTIVE', lastSync: '4 mins ago' },
    { id: 'SagarDrishti-003', location: 'Kudal Bridge, Karli Central', status: 'MAINTENANCE', lastSync: '1 hour ago' },
    { id: 'SagarDrishti-004', location: 'Devbag Creek, Karli Mouth', status: 'ACTIVE', lastSync: 'Just now' }
  ];

  filteredNodes = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.nodes;
    return this.nodes.filter(n => 
      n.id.toLowerCase().includes(q) || 
      n.location.toLowerCase().includes(q)
    );
  });

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const q = params.get('q');
      this.searchQuery.set(q || '');
    });
  }

  clearFilter() {
    this.router.navigate([], { queryParams: {} });
  }

  viewTelemetry(nodeId: string) {
    this.router.navigate(['/dashboard'], { queryParams: { node: nodeId } });
  }
}
