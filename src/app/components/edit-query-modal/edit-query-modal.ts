import { Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Modal } from '../modal/modal';
import { UiStateService } from '../../services/ui-state.service';
import { EditsService } from '../../services/edits.service';

@Component({
  selector: 'app-edit-query-modal',
  standalone: true,
  imports: [Modal, FormsModule],
  template: `
    @if (ui.editQuery(); as ctx) {
      <app-modal title="Edit query" width="xl" (close)="ui.closeAll()">
        <div class="flex flex-col gap-4">
          <p class="text-xs text-slate-500 dark:text-slate-400">
            {{ ctx.category.name }} &rsaquo; {{ ctx.job.name }}
          </p>

          <label class="flex flex-col gap-1">
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Query name</span>
            <input
              type="text"
              [(ngModel)]="name"
              class="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </label>

          <label class="flex flex-col gap-1">
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Description</span>
            <input
              type="text"
              [(ngModel)]="description"
              class="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </label>

          <label class="flex flex-col gap-1">
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">SQL</span>
            <textarea
              [(ngModel)]="sqlPreview"
              rows="8"
              class="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-black px-3 py-2 font-mono text-xs leading-relaxed text-slate-100 focus:outline-none"
            ></textarea>
          </label>

          <label class="flex flex-col gap-1">
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Explain plan</span>
            <textarea
              [(ngModel)]="explainPlan"
              rows="8"
              placeholder="Paste EXPLAIN (ANALYZE) output…"
              class="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-black px-3 py-2 font-mono text-xs leading-relaxed text-emerald-300 focus:outline-none"
            ></textarea>
          </label>

          <div class="flex justify-end gap-2 pt-2">
            <button type="button" (click)="ui.closeAll()" class="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
              Cancel
            </button>
            <button type="button" (click)="save(ctx.query.id)" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
              Save changes
            </button>
          </div>
        </div>
      </app-modal>
    }
  `,
})
export class EditQueryModal {
  readonly ui = inject(UiStateService);
  private readonly edits = inject(EditsService);

  name = '';
  description = '';
  sqlPreview = '';
  explainPlan = '';

  constructor() {
    effect(() => {
      const ctx = this.ui.editQuery();
      if (!ctx) return;
      this.name = ctx.query.name;
      this.description = ctx.query.description;
      this.sqlPreview = ctx.query.sqlPreview;
      this.explainPlan = ctx.query.explainPlan ?? '';
    });
  }

  save(queryId: string): void {
    const explainPlan = this.explainPlan.trim();
    this.edits.updateQuery(queryId, {
      name: this.name.trim(),
      description: this.description.trim(),
      sqlPreview: this.sqlPreview,
      explainPlan: explainPlan || undefined,
      status: explainPlan ? 'healthy' : 'unverified',
    });
    this.ui.closeAll();
  }
}
