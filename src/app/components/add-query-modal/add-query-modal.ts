import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Modal } from '../modal/modal';
import { UiStateService } from '../../services/ui-state.service';
import { EditsService } from '../../services/edits.service';
import { makeQueryId } from '../../utils/ids';

@Component({
  selector: 'app-add-query-modal',
  standalone: true,
  imports: [Modal, FormsModule],
  template: `
    @if (ui.addQuery(); as state) {
      <app-modal title="Add query" width="lg" (close)="ui.closeAll()">
        <div class="flex flex-col gap-4">
          <p class="text-sm text-slate-500 dark:text-slate-400">
            Adding to <span class="font-semibold text-slate-900 dark:text-slate-100">{{ state.job.name }}</span>
          </p>

          <label class="flex flex-col gap-1">
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Query name *</span>
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
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">SQL *</span>
            <textarea
              [(ngModel)]="sqlPreview"
              rows="6"
              class="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-black px-3 py-2 font-mono text-xs leading-relaxed text-slate-100 focus:outline-none"
            ></textarea>
          </label>

          @if (error()) {
            <p class="text-sm text-rose-600 dark:text-rose-400">{{ error() }}</p>
          }

          <div class="flex justify-end gap-2 pt-2">
            <button type="button" (click)="ui.closeAll()" class="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
              Cancel
            </button>
            <button type="button" (click)="save(state.job.id)" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
              Add query
            </button>
          </div>
        </div>
      </app-modal>
    }
  `,
})
export class AddQueryModal {
  readonly ui = inject(UiStateService);
  private readonly edits = inject(EditsService);

  name = '';
  description = '';
  sqlPreview = '';
  readonly error = signal('');

  save(jobId: string): void {
    if (!this.name.trim() || !this.sqlPreview.trim()) {
      this.error.set('Query name and SQL are both required.');
      return;
    }
    this.edits.addQueryToJob(jobId, {
      id: makeQueryId(),
      name: this.name.trim(),
      description: this.description.trim(),
      daoClass: '',
      sqlIdentifier: this.name.trim(),
      status: 'unverified',
      sqlPreview: this.sqlPreview.trim(),
    });
    this.name = '';
    this.description = '';
    this.sqlPreview = '';
    this.error.set('');
    this.ui.closeAll();
  }
}
