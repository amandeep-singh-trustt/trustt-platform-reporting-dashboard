import { Component, input, signal } from '@angular/core';
import { Icon } from '../icon/icon';
import { QueryCard } from '../query-card/query-card';
import type { ReportingJob, ReportingCategory } from '../../types/reporting.types';

@Component({
  selector: 'app-job-accordion',
  standalone: true,
  imports: [Icon, QueryCard],
  template: `
    <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-shadow hover:shadow-md">
      <button
        type="button"
        (click)="toggle()"
        class="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span class="flex items-center justify-center size-6 shrink-0 text-slate-400 dark:text-slate-500 transition-transform duration-200" [class.rotate-90]="expanded()">
          <app-icon name="chevron-right" [size]="16" />
        </span>
        <span class="flex-1 font-bold text-slate-900 dark:text-slate-100">{{ job().name }}</span>
        <span class="shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          {{ job().queries.length }} {{ job().queries.length === 1 ? 'query' : 'queries' }}
        </span>
      </button>

      @if (expanded()) {
        <div class="overflow-hidden border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 transition-all duration-200">
          @if (job().queries.length === 0) {
            <p class="text-sm text-slate-500 dark:text-slate-400">No queries</p>
          } @else {
            <div class="flex flex-col gap-2">
              @for (query of job().queries; track query.id) {
                <app-query-card [query]="query" [job]="job()" [category]="category()" />
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class JobAccordion {
  readonly job = input.required<ReportingJob>();
  readonly category = input.required<ReportingCategory>();

  readonly expanded = signal(false);

  toggle(): void {
    this.expanded.update((v) => !v);
  }
}
