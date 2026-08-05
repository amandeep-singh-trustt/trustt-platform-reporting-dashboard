import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { Icon } from '../../components/icon/icon';
import { QueryCard } from '../../components/query-card/query-card';
import { ReportingDataService } from '../../services/reporting-data.service';
import { UiStateService } from '../../services/ui-state.service';
import { categoryStyle } from '../../utils/category-style';
import type { SqlQuery } from '../../types/reporting.types';

@Component({
  selector: 'app-job-detail-page',
  standalone: true,
  imports: [Icon, QueryCard, RouterLink],
  template: `
    @if (category(); as cat) {
      @if (job(); as j) {
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 animate-fade-in-down">
            <a [routerLink]="['/category', cat.id]" class="hover:text-slate-900 dark:hover:text-slate-100">{{ cat.name }}</a>
            <app-icon name="chevron-right" [size]="12" />
            <span class="text-slate-900 dark:text-slate-100">{{ j.name }}</span>
          </div>

          <div class="flex items-start justify-between gap-3 animate-fade-in-down">
            <div class="flex items-center gap-3">
              <span class="flex items-center justify-center size-11 rounded-xl" [class]="style(cat.id).badge">
                <app-icon [name]="style(cat.id).icon" [size]="20" />
              </span>
              <div>
                <h1 class="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{{ j.name }}</h1>
                <p class="text-sm text-slate-500 dark:text-slate-400">{{ j.queries.length }} {{ j.queries.length === 1 ? 'query' : 'queries' }}</p>
              </div>
            </div>
            <div class="flex shrink-0 items-center gap-2">
              <button
                type="button"
                (click)="ui.openRenameJob(j)"
                class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700"
              >
                <app-icon name="pencil" [size]="14" /> Rename
              </button>
              <button
                type="button"
                (click)="ui.openMoveJob(j)"
                class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700"
              >
                <app-icon name="move" [size]="14" /> Move
              </button>
            </div>
          </div>

          <div class="relative">
            <span class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
              <app-icon name="filter" [size]="14" />
            </span>
            <input
              type="text"
              [value]="queryFilter()"
              (input)="queryFilter.set($any($event.target).value)"
              placeholder="Filter queries…"
              class="w-72 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          <div class="flex flex-col gap-2">
            @for (query of filteredQueries(); track query.id; let i = $index) {
              <div class="animate-fade-in-up" [style.animation-delay.ms]="(i % 10) * 25">
                <app-query-card [query]="query" [job]="j" [category]="cat" />
              </div>
            } @empty {
              <div class="flex flex-col items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-10 text-slate-400 dark:text-slate-500">
                <app-icon name="inbox" [size]="24" />
                <p class="text-sm">No queries match your filter</p>
              </div>
            }
          </div>

          <button
            type="button"
            (click)="ui.openAddQuery(j)"
            class="inline-flex items-center justify-center gap-1.5 self-start rounded-lg border border-dashed border-slate-300 dark:border-slate-700 px-3.5 py-2 text-sm font-medium text-slate-500 hover:border-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <app-icon name="plus" [size]="14" /> Add query to this job
          </button>
        </div>
      } @else {
        <div class="flex flex-col items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-10 text-slate-400 dark:text-slate-500">
          <app-icon name="inbox" [size]="24" />
          <p class="text-sm">Unknown job</p>
        </div>
      }
    }
  `,
})
export class JobDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly data = inject(ReportingDataService);
  readonly ui = inject(UiStateService);
  protected readonly style = categoryStyle;

  private readonly categoryIdSignal = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('categoryId') ?? '')),
    { initialValue: '' },
  );
  private readonly jobIdSignal = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('jobId') ?? '')),
    { initialValue: '' },
  );

  readonly category = computed(() => this.data.categoryById(this.categoryIdSignal()));
  readonly job = computed(() => this.category()?.jobs.find((j) => j.id === this.jobIdSignal()));

  readonly queryFilter = signal('');

  readonly filteredQueries = computed<SqlQuery[]>(() => {
    const queries = this.job()?.queries ?? [];
    const term = this.queryFilter().trim().toLowerCase();
    if (!term) return queries;
    return queries.filter((q) => q.name.toLowerCase().includes(term));
  });
}
