import { Component, HostListener, inject, signal } from '@angular/core';
import { Icon } from '../icon/icon';
import { SelectedQueryService } from '../../services/selected-query.service';
import { DbObjectsService } from '../../services/db-objects.service';
import type { DbObjectDefinition, DbObjectKind } from '../../types/reporting.types';

import { NgTemplateOutlet } from '@angular/common';

const WIDTH_STORAGE_KEY = 'aitdp-reporting-drawer-width';
const MIN_WIDTH = 420;

@Component({
  selector: 'app-query-drawer',
  standalone: true,
  imports: [Icon, NgTemplateOutlet],
  template: `
    @if (selected.context(); as ctx) {
      <div class="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] animate-fade-in" (click)="selected.close()"></div>

      <div
        class="fixed inset-y-0 right-0 z-50 flex max-w-[95vw] min-w-[22rem] flex-col overflow-y-auto border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-slide-in-right"
        [style.width.px]="width()"
        [class.select-none]="dragging()"
      >
        <div
          (pointerdown)="startResize($event)"
          title="Drag to resize"
          class="group absolute inset-y-0 left-0 z-20 w-1.5 -translate-x-1/2 cursor-ew-resize touch-none"
        >
          <div class="mx-auto h-full w-px bg-transparent transition-colors group-hover:bg-indigo-400" [class.bg-indigo-500]="dragging()"></div>
        </div>

        <div class="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-200 bg-gradient-to-br from-indigo-50/90 to-white/90 p-5 backdrop-blur dark:border-slate-800 dark:from-indigo-500/10 dark:to-slate-900/90">
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span class="truncate max-w-[40%]">{{ ctx.category.name }}</span>
              <app-icon name="chevron-right" [size]="12" class="shrink-0" />
              <span class="truncate">{{ ctx.job.name }}</span>
            </div>
            <h2 class="mt-1 text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 break-words">{{ ctx.query.name }}</h2>
          </div>
          <button
            type="button"
            (click)="selected.close()"
            class="shrink-0 rounded-lg p-1.5 text-slate-500 hover:bg-white/70 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <app-icon name="x" [size]="20" />
          </button>
        </div>

        <div class="space-y-8 p-6">
          <section>
            <h3 class="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Details</h3>
            <div class="grid grid-cols-1 gap-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 text-sm sm:grid-cols-2">
              <div class="flex min-w-0 justify-between gap-4 sm:flex-col sm:justify-start sm:gap-0.5">
                <span class="shrink-0 text-slate-500 dark:text-slate-400">SQL Identifier</span>
                <span class="min-w-0 break-all font-mono text-sm text-slate-900 dark:text-slate-100">{{ ctx.query.sqlIdentifier }}</span>
              </div>
              <div class="flex min-w-0 justify-between gap-4 sm:flex-col sm:justify-start sm:gap-0.5">
                <span class="shrink-0 text-slate-500 dark:text-slate-400">DAO Class</span>
                <span class="min-w-0 break-all font-mono text-sm text-slate-900 dark:text-slate-100">{{ ctx.query.daoClass }}</span>
              </div>
              @if (ctx.query.description) {
                <div class="min-w-0 border-t border-slate-200 dark:border-slate-800 pt-2.5 sm:col-span-2">
                  <span class="text-slate-500 dark:text-slate-400">Description</span>
                  <p class="mt-1 break-words text-slate-900 dark:text-slate-100">{{ ctx.query.description }}</p>
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
            <pre class="max-h-80 overflow-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-black p-4 text-sm leading-relaxed text-slate-100 whitespace-pre-wrap break-words font-mono">{{ ctx.query.sqlPreview || 'No SQL captured for this query.' }}</pre>
          </section>

          <section>
            <h3 class="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Explain Plan</h3>
            @if (ctx.query.explainPlan) {
              <pre class="max-h-[32rem] overflow-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-black p-4 text-sm leading-relaxed text-emerald-300 whitespace-pre font-mono">{{ ctx.query.explainPlan }}</pre>
            } @else if (ctx.query.reviewReason) {
              <div class="flex items-start gap-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/10 p-3.5">
                <app-icon name="lightbulb" [size]="16" class="mt-0.5 shrink-0 text-amber-500" />
                <div class="text-sm">
                  <p class="font-semibold text-amber-800 dark:text-amber-400">Needs manual review</p>
                  <p class="mt-0.5 text-xs text-amber-700/80 dark:text-amber-400/70">{{ ctx.query.reviewReason }}</p>
                </div>
              </div>
            } @else {
              <div class="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 p-7 text-center">
                <span class="flex items-center justify-center size-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                  <app-icon name="clock" [size]="18" />
                </span>
                <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Not yet analyzed</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">This query hasn't been run through the EXPLAIN pipeline yet.</p>
              </div>
            }
          </section>

          @if (referencedObjects(ctx.query.dbObjectRefs, 'view').length) {
            <section>
              <h3 class="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Referenced Views</h3>
              <div class="flex flex-col gap-4">
                @for (item of referencedObjects(ctx.query.dbObjectRefs, 'view'); track item.name) {
                  <ng-container [ngTemplateOutlet]="dbObjectBlock" [ngTemplateOutletContext]="{ $implicit: item }" />
                }
              </div>
            </section>
          }

          @if (referencedObjects(ctx.query.dbObjectRefs, 'table').length) {
            <section>
              <h3 class="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Referenced Staging Tables</h3>
              <div class="flex flex-col gap-4">
                @for (item of referencedObjects(ctx.query.dbObjectRefs, 'table'); track item.name) {
                  <ng-container [ngTemplateOutlet]="dbObjectBlock" [ngTemplateOutletContext]="{ $implicit: item }" />
                }
              </div>
            </section>
          }

          <ng-template #dbObjectBlock let-item>
            <div class="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div class="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 px-3.5 py-2 border-b border-slate-200 dark:border-slate-800">
                <app-icon name="database" [size]="13" class="text-slate-400" />
                <span class="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">{{ item.name }}</span>
                @if (item.def?.sourceFile) {
                  <span class="ml-auto text-[11px] text-slate-400 truncate max-w-[40%]" [title]="item.def.sourceFile">{{ item.def.sourceFile }}</span>
                }
              </div>
              @if (item.def?.definition) {
                <pre class="max-h-64 overflow-auto bg-slate-900 dark:bg-black p-3.5 text-xs leading-relaxed text-slate-100 whitespace-pre font-mono">{{ item.def.definition }}</pre>
                @if (item.def.explainPlan) {
                  <pre class="max-h-64 overflow-auto bg-slate-900 dark:bg-black p-3.5 text-xs leading-relaxed text-emerald-300 whitespace-pre font-mono border-t border-slate-800">{{ item.def.explainPlan }}</pre>
                } @else {
                  <div class="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800">
                    <app-icon name="clock" [size]="12" />
                    Explain plan not yet analyzed
                  </div>
                }
              } @else {
                <p class="p-3.5 text-xs text-slate-400">Definition not found in migrations.</p>
              }
            </div>
          </ng-template>

          <section>
            <h3 class="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Performance Metrics</h3>
            <div class="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 p-7 text-center">
              <span class="flex items-center justify-center size-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                <app-icon name="gauge" [size]="18" />
              </span>
              <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Coming in Phase 2</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">Latency and throughput metrics will appear here.</p>
            </div>
          </section>
        </div>
      </div>
    }
  `,
})
export class QueryDrawer {
  readonly selected = inject(SelectedQueryService);
  readonly dbObjects = inject(DbObjectsService);

  readonly copied = signal(false);
  readonly width = signal(this.initialWidth());
  readonly dragging = signal(false);

  private dragStartX = 0;
  private dragStartWidth = 0;

  private initialWidth(): number {
    const stored = Number(localStorage.getItem(WIDTH_STORAGE_KEY));
    if (stored) return this.clamp(stored);
    return this.clamp(Math.round(window.innerWidth * 0.75));
  }

  private clamp(px: number): number {
    const max = Math.round(window.innerWidth * 0.95);
    return Math.min(Math.max(px, MIN_WIDTH), max);
  }

  startResize(event: PointerEvent): void {
    event.preventDefault();
    this.dragging.set(true);
    this.dragStartX = event.clientX;
    this.dragStartWidth = this.width();

    const onMove = (e: PointerEvent) => {
      const delta = this.dragStartX - e.clientX;
      this.width.set(this.clamp(this.dragStartWidth + delta));
    };
    const onUp = () => {
      this.dragging.set(false);
      localStorage.setItem(WIDTH_STORAGE_KEY, String(this.width()));
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.selected.close();
  }

  copySql(sql: string): void {
    navigator.clipboard?.writeText(sql);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }

  referencedObjects(refs: string[] | undefined, kind: DbObjectKind): { name: string; def: DbObjectDefinition | undefined }[] {
    if (!refs?.length) return [];
    return refs
      .map((name) => ({ name, def: this.dbObjects.byName(name) }))
      .filter((item) => (item.def?.kind ?? 'view') === kind);
  }
}
