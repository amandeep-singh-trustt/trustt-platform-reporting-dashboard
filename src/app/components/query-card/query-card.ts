import { Component, inject, input } from '@angular/core';
import { Icon } from '../icon/icon';
import { SelectedQueryService } from '../../services/selected-query.service';
import type { SqlQuery, ReportingJob, ReportingCategory, QueryStatus } from '../../types/reporting.types';

@Component({
  selector: 'app-query-card',
  standalone: true,
  imports: [Icon],
  template: `
    <div
      (click)="onOpen()"
      class="group flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 shadow-sm transition hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
    >
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <span class="truncate font-bold text-slate-900 dark:text-slate-100">{{ query().name }}</span>
          <span class="shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
            {{ query().sqlIdentifier }}
          </span>
        </div>
        <p class="truncate text-sm text-slate-500 dark:text-slate-400">{{ query().description }}</p>
      </div>

      <div class="flex shrink-0 items-center gap-3">
        <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium" [class]="statusClasses()">
          <span class="h-1.5 w-1.5 rounded-full" [class]="statusDotClasses()"></span>
          {{ statusLabel() }}
        </span>
        <button
          type="button"
          (click)="onOpen($event)"
          class="text-slate-400 dark:text-slate-500 transition group-hover:text-slate-600 dark:group-hover:text-slate-300"
          aria-label="View details"
        >
          <app-icon name="chevron-right" [size]="18" />
        </button>
      </div>
    </div>
  `,
})
export class QueryCard {
  private readonly selectedQuery = inject(SelectedQueryService);

  readonly query = input.required<SqlQuery>();
  readonly job = input.required<ReportingJob>();
  readonly category = input.required<ReportingCategory>();

  onOpen(event?: MouseEvent): void {
    event?.stopPropagation();
    this.selectedQuery.open({ query: this.query(), job: this.job(), category: this.category() });
  }

  statusClasses(): string {
    const map: Record<QueryStatus, string> = {
      unverified: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
      healthy: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
      'needs-review': 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
      slow: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400',
    };
    return map[this.query().status];
  }

  statusLabel(): string {
    const map: Record<QueryStatus, string> = {
      unverified: 'Pending',
      healthy: 'Analyzed',
      'needs-review': 'Needs review',
      slow: 'Slow',
    };
    return map[this.query().status];
  }

  statusDotClasses(): string {
    const map: Record<QueryStatus, string> = {
      unverified: 'bg-slate-400',
      healthy: 'bg-emerald-500',
      'needs-review': 'bg-amber-500',
      slow: 'bg-rose-500',
    };
    return map[this.query().status];
  }
}
