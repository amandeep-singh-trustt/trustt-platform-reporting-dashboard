import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { Icon } from '../icon/icon';
import { DbObjectsService } from '../../services/db-objects.service';
import type { DbObjectDefinition, DbObjectKind, SqlQuery } from '../../types/reporting.types';

// Body content for "everything about this query" — SQL, explain plan, referenced
// views/staging tables, perf-metrics placeholder. Shared by the inline RepoSection
// row (no click needed) and reused wherever a compact, non-modal rendering is wanted.
@Component({
  selector: 'app-query-details',
  standalone: true,
  imports: [Icon, NgTemplateOutlet],
  template: `
    <div class="space-y-5">
      <section>
        <div class="mb-1.5 flex items-center justify-between">
          <h4 class="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">SQL</h4>
          <button
            type="button"
            (click)="copySql(query().sqlPreview)"
            class="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <app-icon [name]="copied() ? 'check' : 'copy'" [size]="12" />
            {{ copied() ? 'Copied' : 'Copy' }}
          </button>
        </div>
        <pre class="max-h-72 overflow-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-black p-3.5 text-xs leading-relaxed text-slate-100 whitespace-pre-wrap break-words font-mono">{{ query().sqlPreview || 'No SQL captured for this query.' }}</pre>
      </section>

      <section>
        <h4 class="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Explain Plan</h4>
        @if (query().explainPlan) {
          <pre class="max-h-96 overflow-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-black p-3.5 text-xs leading-relaxed text-emerald-300 whitespace-pre font-mono">{{ query().explainPlan }}</pre>
        } @else if (query().reviewReason) {
          <div class="flex items-start gap-2.5 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/10 p-3">
            <app-icon name="lightbulb" [size]="15" class="mt-0.5 shrink-0 text-amber-500" />
            <div class="text-sm">
              <p class="font-semibold text-amber-800 dark:text-amber-400">Needs manual review</p>
              <p class="mt-0.5 text-xs text-amber-700/80 dark:text-amber-400/70">{{ query().reviewReason }}</p>
            </div>
          </div>
        } @else {
          <div class="flex items-center gap-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 px-3.5 py-3 text-slate-400 dark:text-slate-500">
            <app-icon name="clock" [size]="15" />
            <p class="text-xs">Not yet analyzed — hasn't run through the EXPLAIN pipeline yet.</p>
          </div>
        }
      </section>

      @if (referencedObjects('view').length) {
        <section>
          <h4 class="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Referenced Views</h4>
          <div class="flex flex-col gap-3">
            @for (item of referencedObjects('view'); track item.name) {
              <ng-container [ngTemplateOutlet]="dbObjectBlock" [ngTemplateOutletContext]="{ $implicit: item }" />
            }
          </div>
        </section>
      }

      @if (referencedObjects('table').length) {
        <section>
          <h4 class="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Referenced Staging Tables</h4>
          <div class="flex flex-col gap-3">
            @for (item of referencedObjects('table'); track item.name) {
              <ng-container [ngTemplateOutlet]="dbObjectBlock" [ngTemplateOutletContext]="{ $implicit: item }" />
            }
          </div>
        </section>
      }

      <ng-template #dbObjectBlock let-item>
        <div class="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div class="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 border-b border-slate-200 dark:border-slate-800">
            <app-icon name="database" [size]="12" class="text-slate-400 shrink-0" />
            <span class="min-w-0 truncate font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">{{ item.name }}</span>
            @if (item.def?.sourceFile) {
              <span class="ml-auto shrink-0 text-[11px] text-slate-400 truncate max-w-[40%]" [title]="item.def.sourceFile">{{ item.def.sourceFile }}</span>
            }
          </div>
          @if (item.def?.definition) {
            <pre class="max-h-56 overflow-auto bg-slate-900 dark:bg-black p-3 text-xs leading-relaxed text-slate-100 whitespace-pre font-mono">{{ item.def.definition }}</pre>
            @if (item.def.explainPlan) {
              <pre class="max-h-56 overflow-auto bg-slate-900 dark:bg-black p-3 text-xs leading-relaxed text-emerald-300 whitespace-pre font-mono border-t border-slate-800">{{ item.def.explainPlan }}</pre>
            } @else {
              <div class="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800">
                <app-icon name="clock" [size]="11" />
                Explain plan not yet analyzed
              </div>
            }
          } @else {
            <p class="p-3 text-xs text-slate-400">Definition not found in migrations.</p>
          }
        </div>
      </ng-template>
    </div>
  `,
})
export class QueryDetails {
  private readonly dbObjects = inject(DbObjectsService);

  readonly query = input.required<SqlQuery>();
  readonly copied = signal(false);

  copySql(sql: string): void {
    navigator.clipboard?.writeText(sql);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }

  referencedObjects(kind: DbObjectKind): { name: string; def: DbObjectDefinition | undefined }[] {
    const refs = this.query().dbObjectRefs;
    if (!refs?.length) return [];
    return refs
      .map((name) => ({ name, def: this.dbObjects.byName(name) }))
      .filter((item) => (item.def?.kind ?? 'view') === kind);
  }
}
