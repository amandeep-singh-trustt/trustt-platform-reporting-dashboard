import { Component, effect, inject, input, output, signal } from '@angular/core';
import { Icon } from '../icon/icon';
import { QueryDetails } from '../query-details/query-details';
import { UiStateService } from '../../services/ui-state.service';
import { EditsService } from '../../services/edits.service';
import type { QueryStatus, ReportApproach, SqlQuery } from '../../types/reporting.types';

const APPROACH_BADGE: Record<ReportApproach, string> = {
  chunk: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400',
  cursor: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400',
};
const APPROACH_LABEL: Record<ReportApproach, string> = {
  chunk: 'Chunking based',
  cursor: 'Cursor based',
};

const STATUS_BADGE: Record<QueryStatus, string> = {
  unverified: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
  healthy: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
  'needs-review': 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
  slow: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400',
};
const STATUS_LABEL: Record<QueryStatus, string> = {
  unverified: 'Pending',
  healthy: 'Analyzed',
  'needs-review': 'Needs review',
  slow: 'Slow',
};
const STATUS_DOT: Record<QueryStatus, string> = {
  unverified: 'bg-slate-400',
  healthy: 'bg-emerald-500',
  'needs-review': 'bg-amber-500',
  slow: 'bg-rose-500',
};

@Component({
  selector: 'app-repo-section',
  standalone: true,
  imports: [Icon, QueryDetails],
  template: `
    <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-shadow hover:shadow-md">
      <div class="flex items-center gap-1 px-2 py-1.5">
        <button type="button" (click)="toggle()" class="flex flex-1 min-w-0 items-center gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50">
          <span class="flex items-center justify-center size-6 shrink-0 text-slate-400 dark:text-slate-500 transition-transform duration-200" [class.rotate-90]="expanded()">
            <app-icon name="chevron-right" [size]="16" />
          </span>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-900 dark:text-slate-100 truncate">{{ name() }}</span>
              <span class="shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                {{ queries().length }} {{ queries().length === 1 ? 'query' : 'queries' }}
              </span>
              @if (approach()) {
                <span class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium" [class]="approachClasses()">
                  {{ approachLabel() }}
                </span>
              }
            </div>
            @if (subtitle()) {
              <div class="truncate font-mono text-[11px] text-slate-400 dark:text-slate-500">{{ subtitle() }}</div>
            }
          </div>
          @if (queries().length && !expanded()) {
            <div class="hidden sm:flex shrink-0 items-center gap-2 text-[11px]">
              @if (statusCount('healthy')) {
                <span class="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>{{ statusCount('healthy') }}
                </span>
              }
              @if (statusCount('needs-review')) {
                <span class="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span>{{ statusCount('needs-review') }}
                </span>
              }
              @if (statusCount('unverified')) {
                <span class="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500">
                  <span class="h-1.5 w-1.5 rounded-full bg-slate-400"></span>{{ statusCount('unverified') }}
                </span>
              }
            </div>
          }
        </button>
        @if (canRename()) {
          <button
            type="button"
            (click)="rename.emit()"
            title="Rename"
            class="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <app-icon name="pencil" [size]="15" />
          </button>
        }
        @if (canMove()) {
          <button
            type="button"
            (click)="move.emit()"
            title="Move to another category"
            class="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <app-icon name="move" [size]="15" />
          </button>
        }
      </div>

      @if (expanded()) {
        <div class="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-4 animate-fade-in-down">
          @if (queries().length === 0) {
            <p class="text-sm text-slate-500 dark:text-slate-400">No queries</p>
          } @else {
            <div class="flex flex-col gap-5">
              @for (query of queries(); track query.id) {
                <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                  <div class="mb-3 flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-slate-900 dark:text-slate-100 truncate">{{ query.name }}</span>
                        <span class="shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {{ query.sqlIdentifier }}
                        </span>
                      </div>
                      @if (query.description) {
                        <p class="truncate text-sm text-slate-500 dark:text-slate-400">{{ query.description }}</p>
                      }
                    </div>
                    <div class="flex shrink-0 items-center gap-2">
                      <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium" [class]="statusClasses(query.status)">
                        <span class="h-1.5 w-1.5 rounded-full" [class]="statusDot(query.status)"></span>
                        {{ statusLabel(query.status) }}
                      </span>
                      <button
                        type="button"
                        (click)="ui.openEditQuery({ query, job: pseudoJob(), category: pseudoCategory() })"
                        class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                        aria-label="Edit query"
                      >
                        <app-icon name="pencil" [size]="15" />
                      </button>
                      <button
                        type="button"
                        (click)="onDelete(query)"
                        class="text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400"
                        aria-label="Delete query"
                      >
                        <app-icon name="trash" [size]="15" />
                      </button>
                    </div>
                  </div>
                  <app-query-details [query]="query" />
                </div>
              }
            </div>
          }
          @if (canAddQuery()) {
            <button
              type="button"
              (click)="addQuery.emit()"
              class="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-500 hover:border-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <app-icon name="plus" [size]="12" /> Add query to this job
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class RepoSection {
  readonly ui = inject(UiStateService);
  private readonly edits = inject(EditsService);

  readonly name = input.required<string>();
  readonly subtitle = input<string>();
  readonly queries = input.required<SqlQuery[]>();
  readonly canRename = input(false);
  readonly canMove = input(false);
  readonly canAddQuery = input(false);
  readonly pseudoJobId = input<string>('');
  readonly pseudoCategoryId = input<string>('');
  readonly pseudoCategoryName = input<string>('');
  readonly approach = input<ReportApproach | null | undefined>(null);
  // driven by the page: true while a filter/search term is active (auto-reveal matches) or
  // "Expand all" is toggled on. Transitions sync `expanded`; a manual click in between still works.
  readonly autoExpand = input(false);

  readonly rename = output<void>();
  readonly move = output<void>();
  readonly addQuery = output<void>();

  readonly expanded = signal(false);

  constructor() {
    effect(() => {
      this.expanded.set(this.autoExpand());
    });
  }

  toggle(): void {
    this.expanded.update((v) => !v);
  }

  statusCount(status: QueryStatus): number {
    return this.queries().filter((q) => q.status === status).length;
  }

  statusClasses(status: QueryStatus): string {
    return STATUS_BADGE[status];
  }

  statusLabel(status: QueryStatus): string {
    return STATUS_LABEL[status];
  }

  statusDot(status: QueryStatus): string {
    return STATUS_DOT[status];
  }

  approachClasses(): string {
    const a = this.approach();
    return a ? APPROACH_BADGE[a] : '';
  }

  approachLabel(): string {
    const a = this.approach();
    return a ? APPROACH_LABEL[a] : '';
  }

  onDelete(query: SqlQuery): void {
    if (confirm(`Remove query "${query.name}"? This cannot be undone.`)) {
      this.edits.deleteQuery(query.id);
    }
  }

  // ReportingJob/ReportingCategory-shaped stand-ins so EditQueryModal (typed on QueryContext)
  // works unmodified for both Reports jobs and OLTP DAO-groups.
  pseudoJob() {
    return { id: this.pseudoJobId(), name: this.name(), categoryId: this.pseudoCategoryId(), queries: this.queries() };
  }

  pseudoCategory() {
    return { id: this.pseudoCategoryId(), name: this.pseudoCategoryName(), jobs: [] };
  }
}
