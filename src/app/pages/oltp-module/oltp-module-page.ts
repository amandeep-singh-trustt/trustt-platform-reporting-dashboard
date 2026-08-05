import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { Icon } from '../../components/icon/icon';
import { RepoSection } from '../../components/repo-section/repo-section';
import { OltpDataService } from '../../services/oltp-data.service';
import { SearchService } from '../../services/search.service';
import { OrderService } from '../../services/order.service';
import { DragReorderDirective } from '../../directives/drag-reorder.directive';
import { FlipGroupDirective } from '../../directives/flip-group.directive';
import type { OltpDaoGroup } from '../../types/reporting.types';
import { applyOrder, reorderIds } from '../../utils/apply-order';

@Component({
  selector: 'app-oltp-module-page',
  standalone: true,
  imports: [Icon, RepoSection, DragReorderDirective, FlipGroupDirective],
  template: `
    @if (moduleSummary(); as mod) {
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-3 animate-fade-in-down">
          <span class="flex items-center justify-center size-11 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
            <app-icon name="database" [size]="20" />
          </span>
          <div>
            <h1 class="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{{ mod.name }}</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ mod.daoGroupCount }} DAO classes &middot; {{ mod.queryCount }} queries</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <div class="relative">
            <span class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
              <app-icon name="filter" [size]="14" />
            </span>
            <input
              type="text"
              [value]="nameFilter()"
              (input)="nameFilter.set($any($event.target).value)"
              placeholder="Filter DAO classes…"
              class="w-72 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
          <button
            type="button"
            (click)="toggleSort()"
            class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <app-icon name="arrow-up-down" [size]="14" />
            {{ sortAsc() ? 'A–Z' : 'Z–A' }}
          </button>
        </div>

        @if (!oltp.isModuleLoaded(moduleId())) {
          <div class="flex flex-col gap-3">
            @for (i of [1, 2, 3, 4, 5, 6]; track i) {
              <div class="h-14 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            }
          </div>
        } @else {
          <div class="flex flex-col gap-3" appFlipGroup>
            @for (group of filteredGroups(); track group.id; let i = $index) {
              <div
                class="animate-fade-in-up"
                [style.animation-delay.ms]="(i % 15) * 20"
                [attr.data-flip-key]="group.id"
                [appDragReorder]="i"
                (hoverReorder)="onReorder($event)"
              >
                <app-repo-section
                  [name]="group.name"
                  [subtitle]="group.daoClass"
                  [queries]="group.queries"
                  [pseudoJobId]="group.id"
                  [pseudoCategoryId]="moduleId()"
                  [pseudoCategoryName]="mod.name"
                />
              </div>
            } @empty {
              <div class="flex flex-col items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-10 text-slate-400 dark:text-slate-500">
                <app-icon name="inbox" [size]="24" />
                <p class="text-sm">No DAO classes match your filter</p>
              </div>
            }
          </div>
        }
      </div>
    } @else {
      <div class="flex flex-col items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-10 text-slate-400 dark:text-slate-500">
        <app-icon name="inbox" [size]="24" />
        <p class="text-sm">Unknown module</p>
      </div>
    }
  `,
})
export class OltpModulePage {
  private readonly route = inject(ActivatedRoute);
  protected readonly oltp = inject(OltpDataService);
  private readonly search = inject(SearchService);
  private readonly order = inject(OrderService);

  readonly moduleId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('moduleId') ?? '')),
    { initialValue: '' },
  );

  readonly moduleSummary = computed(() => this.oltp.moduleSummary(this.moduleId()));

  readonly nameFilter = signal('');
  readonly sortAsc = signal(true);

  toggleSort(): void {
    this.sortAsc.update((v) => !v);
    this.order.clearOrder(this.orderKey());
  }

  private orderKey(): string {
    return `oltp-module:${this.moduleId()}`;
  }

  readonly filteredGroups = computed<OltpDaoGroup[]>(() => {
    const groups = this.oltp.daoGroups(this.moduleId());
    const nameFilter = this.nameFilter().trim().toLowerCase();
    const globalTerm = this.search.term().trim().toLowerCase();

    const filtered = groups.filter((g) => {
      if (nameFilter && !g.name.toLowerCase().includes(nameFilter) && !g.daoClass.toLowerCase().includes(nameFilter)) {
        return false;
      }
      if (globalTerm) {
        const groupMatches = g.name.toLowerCase().includes(globalTerm) || g.daoClass.toLowerCase().includes(globalTerm);
        const queryMatches = g.queries.some((q) => q.name.toLowerCase().includes(globalTerm));
        if (!groupMatches && !queryMatches) {
          return false;
        }
      }
      return true;
    });

    const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    const result = this.sortAsc() ? sorted : sorted.reverse();
    return applyOrder(result, (g) => g.id, this.order.getOrder(this.orderKey()));
  });

  onReorder(event: { from: number; to: number }): void {
    const ids = this.filteredGroups().map((g) => g.id);
    this.order.setOrder(this.orderKey(), reorderIds(ids, event.from, event.to));
  }

  constructor() {
    effect(() => {
      const id = this.moduleId();
      if (id) this.oltp.loadModule(id).subscribe();
    });
  }
}
