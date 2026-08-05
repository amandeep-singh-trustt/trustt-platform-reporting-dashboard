import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon/icon';
import type { QueryStatus, SqlQuery } from '../../types/reporting.types';

@Component({
  selector: 'app-group-card',
  standalone: true,
  imports: [RouterLink, Icon],
  template: `
    <a
      [routerLink]="routerLink()"
      draggable="false"
      class="group relative flex flex-col gap-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4 transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
    >
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <div class="truncate font-bold text-slate-900 dark:text-slate-100" [title]="name()">{{ name() }}</div>
          @if (subtitle()) {
            <div class="truncate font-mono text-[11px] text-slate-400 dark:text-slate-500" [title]="subtitle()!">{{ subtitle() }}</div>
          }
        </div>
        <div class="flex shrink-0 items-center gap-0.5">
          @if (canRename()) {
            <button
              type="button"
              (click)="onAction($event, rename)"
              title="Rename"
              class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <app-icon name="pencil" [size]="13" />
            </button>
          }
          @if (canMove()) {
            <button
              type="button"
              (click)="onAction($event, move)"
              title="Move to another category"
              class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <app-icon name="move" [size]="13" />
            </button>
          }
        </div>
      </div>

      <div class="flex items-center justify-between">
        <span class="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          {{ queries().length }} {{ queries().length === 1 ? 'query' : 'queries' }}
        </span>
        <app-icon name="chevron-right" [size]="15" class="text-slate-300 dark:text-slate-600 transition-transform group-hover:translate-x-0.5" />
      </div>

      @if (queries().length) {
        <div class="flex items-center gap-2 text-[11px]">
          @if (counts().healthy) {
            <span class="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>{{ counts().healthy }} analyzed
            </span>
          }
          @if (counts()['needs-review']) {
            <span class="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span>{{ counts()['needs-review'] }} review
            </span>
          }
          @if (counts().unverified) {
            <span class="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500">
              <span class="h-1.5 w-1.5 rounded-full bg-slate-400"></span>{{ counts().unverified }} pending
            </span>
          }
        </div>
      }
    </a>
  `,
})
export class GroupCard {
  readonly name = input.required<string>();
  readonly subtitle = input<string>();
  readonly queries = input.required<SqlQuery[]>();
  readonly routerLink = input.required<unknown[] | string>();
  readonly canRename = input(false);
  readonly canMove = input(false);

  readonly rename = output<void>();
  readonly move = output<void>();

  readonly counts = computed<Record<QueryStatus, number>>(() => {
    const c: Record<QueryStatus, number> = { unverified: 0, healthy: 0, 'needs-review': 0, slow: 0 };
    for (const q of this.queries()) c[q.status]++;
    return c;
  });

  onAction(event: MouseEvent, emitter: { emit: () => void }): void {
    event.preventDefault();
    event.stopPropagation();
    emitter.emit();
  }
}
