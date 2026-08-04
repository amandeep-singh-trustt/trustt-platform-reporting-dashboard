import { Component, HostListener, inject, signal } from '@angular/core';
import { Icon } from '../icon/icon';
import { SelectedQueryService } from '../../services/selected-query.service';

@Component({
  selector: 'app-query-drawer',
  standalone: true,
  imports: [Icon],
  template: `
    @if (selected.context(); as ctx) {
      <div class="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]" (click)="selected.close()"></div>

      <div class="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div class="flex items-start justify-between gap-3 border-b border-slate-200 bg-gradient-to-br from-indigo-50/80 to-transparent p-5 dark:border-slate-800 dark:from-indigo-500/10">
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>{{ ctx.category.name }}</span>
              <app-icon name="chevron-right" [size]="12" />
              <span class="truncate">{{ ctx.job.name }}</span>
            </div>
            <h2 class="mt-1 text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{{ ctx.query.name }}</h2>
          </div>
          <button
            type="button"
            (click)="selected.close()"
            class="shrink-0 rounded-lg p-1.5 text-slate-500 hover:bg-white/70 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <app-icon name="x" [size]="18" />
          </button>
        </div>

        <div class="space-y-6 p-5">
          <section>
            <h3 class="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Details</h3>
            <div class="space-y-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3.5 text-sm">
              <div class="flex justify-between gap-4">
                <span class="text-slate-500 dark:text-slate-400">SQL Identifier</span>
                <span class="font-mono text-xs text-slate-900 dark:text-slate-100">{{ ctx.query.sqlIdentifier }}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-slate-500 dark:text-slate-400">DAO Class</span>
                <span class="font-mono text-xs text-slate-900 dark:text-slate-100">{{ ctx.query.daoClass }}</span>
              </div>
              @if (ctx.query.description) {
                <div class="border-t border-slate-200 dark:border-slate-800 pt-2.5">
                  <span class="text-slate-500 dark:text-slate-400">Description</span>
                  <p class="mt-1 text-slate-900 dark:text-slate-100">{{ ctx.query.description }}</p>
                </div>
              }
            </div>
          </section>

          <section>
            <div class="mb-2 flex items-center justify-between">
              <h3 class="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">SQL</h3>
              <button
                type="button"
                (click)="copySql(ctx.query.sqlPreview)"
                class="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <app-icon [name]="copied() ? 'check' : 'copy'" [size]="12" />
                {{ copied() ? 'Copied' : 'Copy' }}
              </button>
            </div>
            <pre class="max-h-64 overflow-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-black p-3.5 text-xs leading-relaxed text-slate-100 whitespace-pre-wrap break-words font-mono">{{ ctx.query.sqlPreview || 'No SQL captured for this query.' }}</pre>
          </section>

          @for (p of placeholders; track p.title) {
            <section>
              <h3 class="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{{ p.title }}</h3>
              <div class="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 p-7 text-center">
                <span class="flex items-center justify-center size-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                  <app-icon [name]="p.icon" [size]="18" />
                </span>
                <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Coming in Phase 2</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">{{ p.subtitle }}</p>
              </div>
            </section>
          }
        </div>
      </div>
    }
  `,
})
export class QueryDrawer {
  readonly selected = inject(SelectedQueryService);

  readonly copied = signal(false);

  readonly placeholders = [
    {
      icon: 'activity',
      title: 'Explain Plan',
      subtitle: 'EXPLAIN ANALYZE pipeline is running against QA4 — plan will populate here once complete.',
    },
    {
      icon: 'gauge',
      title: 'Performance Metrics',
      subtitle: 'Latency and throughput metrics will appear here.',
    },
  ];

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.selected.close();
  }

  copySql(sql: string): void {
    navigator.clipboard?.writeText(sql);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }
}
