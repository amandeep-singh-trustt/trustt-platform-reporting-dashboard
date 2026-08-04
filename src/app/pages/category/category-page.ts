import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { Icon } from '../../components/icon/icon';
import { JobAccordion } from '../../components/job-accordion/job-accordion';
import { ReportTabs } from '../../components/report-tabs/report-tabs';
import { ReportingDataService } from '../../services/reporting-data.service';
import { SearchService } from '../../services/search.service';
import type { ReportingJob } from '../../types/reporting.types';
import { categoryStyle } from '../../utils/category-style';

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [Icon, JobAccordion, ReportTabs],
  template: `
    <app-report-tabs />
    @if (category(); as cat) {
      <div class="flex flex-col gap-4 mt-4">
        <div class="flex items-center gap-3">
          <span class="flex items-center justify-center size-11 rounded-xl" [class]="style(cat.id).badge">
            <app-icon [name]="style(cat.id).icon" [size]="20" />
          </span>
          <div>
            <h1 class="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{{ cat.name }}</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ cat.jobs.length }} reporting jobs</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <div class="relative">
            <span class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
              <app-icon name="filter" [size]="14" />
            </span>
            <input
              type="text"
              [value]="jobNameFilter()"
              (input)="jobNameFilter.set($any($event.target).value)"
              placeholder="Filter jobs on this page…"
              class="w-64 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
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

        <div class="flex flex-col gap-3">
          @for (job of filteredJobs(); track job.id) {
            <app-job-accordion [job]="job" [category]="cat" />
          } @empty {
            <div class="flex flex-col items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-10 text-slate-400 dark:text-slate-500">
              <app-icon name="inbox" [size]="24" />
              <p class="text-sm">No reporting jobs match your filters</p>
            </div>
          }
        </div>
      </div>
    } @else {
      <div class="flex flex-col items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-10 text-slate-400 dark:text-slate-500">
        <app-icon name="inbox" [size]="24" />
        <p class="text-sm">Unknown category</p>
      </div>
    }
  `,
})
export class CategoryPage {
  private readonly route = inject(ActivatedRoute);
  private readonly data = inject(ReportingDataService);
  readonly search = inject(SearchService);

  private readonly categoryIdSignal = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('categoryId') ?? '')),
    { initialValue: '' },
  );

  readonly category = computed(() => this.data.categoryById(this.categoryIdSignal()));
  protected readonly style = categoryStyle;

  readonly jobNameFilter = signal('');
  readonly sortAsc = signal(true);

  toggleSort(): void {
    this.sortAsc.update((v) => !v);
  }

  readonly filteredJobs = computed<ReportingJob[]>(() => {
    const jobs = this.category()?.jobs ?? [];
    const nameFilter = this.jobNameFilter().trim().toLowerCase();
    const globalTerm = this.search.term().trim().toLowerCase();

    const filtered = jobs.filter((job) => {
      if (nameFilter && !job.name.toLowerCase().includes(nameFilter)) {
        return false;
      }
      if (globalTerm) {
        const jobMatches = job.name.toLowerCase().includes(globalTerm);
        const queryMatches = job.queries.some((q) => q.name.toLowerCase().includes(globalTerm));
        if (!jobMatches && !queryMatches) {
          return false;
        }
      }
      return true;
    });

    const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    return this.sortAsc() ? sorted : sorted.reverse();
  });
}
