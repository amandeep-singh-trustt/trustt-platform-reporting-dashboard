import { Component, inject, input, signal } from '@angular/core';
import { Icon } from '../icon/icon';
import { QueryCard } from '../query-card/query-card';
import { UiStateService } from '../../services/ui-state.service';
import type { ReportingJob, ReportingCategory } from '../../types/reporting.types';

@Component({
  selector: 'app-job-accordion',
  standalone: true,
  imports: [Icon, QueryCard],
  template: `
    <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-shadow hover:shadow-md">
      <div class="flex items-center gap-1 px-2 py-1.5">
        <button type="button" (click)="toggle()" class="flex flex-1 items-center gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50">
          <span class="flex items-center justify-center size-6 shrink-0 text-slate-400 dark:text-slate-500 transition-transform duration-200" [class.rotate-90]="expanded()">
            <app-icon name="chevron-right" [size]="16" />
          </span>
          <span class="flex-1 font-bold text-slate-900 dark:text-slate-100">{{ job().name }}</span>
          <span class="shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            {{ job().queries.length }} {{ job().queries.length === 1 ? 'query' : 'queries' }}
          </span>
        </button>
        <button
          type="button"
          (click)="ui.openRenameJob(job())"
          title="Rename job"
          class="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
        >
          <app-icon name="pencil" [size]="15" />
        </button>
        <button
          type="button"
          (click)="ui.openMoveJob(job())"
          title="Move to another category"
          class="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
        >
          <app-icon name="move" [size]="15" />
        </button>
      </div>

      @if (expanded()) {
        <div class="overflow-hidden border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 animate-fade-in-down">
          @if (job().queries.length === 0) {
            <p class="text-sm text-slate-500 dark:text-slate-400">No queries</p>
          } @else {
            <div class="flex flex-col gap-2">
              @for (query of job().queries; track query.id; let i = $index) {
                <div class="animate-fade-in-up" [style.animation-delay.ms]="(i % 8) * 25">
                  <app-query-card [query]="query" [job]="job()" [category]="category()" />
                </div>
              }
            </div>
          }
          <button
            type="button"
            (click)="ui.openAddQuery(job())"
            class="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-500 hover:border-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <app-icon name="plus" [size]="12" /> Add query to this job
          </button>
        </div>
      }
    </div>
  `,
})
export class JobAccordion {
  readonly ui = inject(UiStateService);

  readonly job = input.required<ReportingJob>();
  readonly category = input.required<ReportingCategory>();

  readonly expanded = signal(false);

  toggle(): void {
    this.expanded.update((v) => !v);
  }
}
