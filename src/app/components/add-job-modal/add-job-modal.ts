import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Modal } from '../modal/modal';
import { Icon } from '../icon/icon';
import { UiStateService } from '../../services/ui-state.service';
import { EditsService } from '../../services/edits.service';
import { ReportingDataService } from '../../services/reporting-data.service';
import { makeJobId, makeQueryId } from '../../utils/ids';

interface QueryDraft {
  name: string;
  description: string;
  sqlPreview: string;
}

function emptyDraft(): QueryDraft {
  return { name: '', description: '', sqlPreview: '' };
}

@Component({
  selector: 'app-add-job-modal',
  standalone: true,
  imports: [Modal, Icon, FormsModule],
  template: `
    @if (ui.addJob(); as state) {
      <app-modal title="Add reporting job" width="lg" (close)="ui.closeAll()">
        <div class="flex flex-col gap-4">
          <label class="flex flex-col gap-1">
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Job name *</span>
            <input
              type="text"
              [(ngModel)]="jobName"
              placeholder="e.g. Loan Summary Report Path"
              class="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </label>

          <label class="flex flex-col gap-1">
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Category *</span>
            <select
              [(ngModel)]="categoryId"
              class="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              @for (c of data.categories(); track c.id) {
                <option [value]="c.id">{{ c.name }}</option>
              }
            </select>
          </label>

          <div class="flex flex-col gap-3">
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Queries *</span>
            @for (q of queries(); track $index) {
              <div class="flex flex-col gap-2 rounded-xl border border-slate-200 dark:border-slate-800 p-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-medium text-slate-400">Query {{ $index + 1 }}</span>
                  @if (queries().length > 1) {
                    <button type="button" (click)="removeQuery($index)" class="text-xs text-rose-500 hover:text-rose-600">Remove</button>
                  }
                </div>
                <input
                  type="text"
                  [(ngModel)]="q.name"
                  placeholder="Query name"
                  class="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                />
                <input
                  type="text"
                  [(ngModel)]="q.description"
                  placeholder="Short description (optional)"
                  class="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                />
                <textarea
                  [(ngModel)]="q.sqlPreview"
                  rows="3"
                  placeholder="SQL text"
                  class="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                ></textarea>
              </div>
            }
            <button
              type="button"
              (click)="addQueryRow()"
              class="inline-flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 py-2 text-sm text-slate-500 hover:border-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <app-icon name="plus" [size]="14" /> Add another query
            </button>
          </div>

          @if (error()) {
            <p class="text-sm text-rose-600 dark:text-rose-400">{{ error() }}</p>
          }

          <div class="flex justify-end gap-2 pt-2">
            <button type="button" (click)="ui.closeAll()" class="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
              Cancel
            </button>
            <button type="button" (click)="save(state.categoryId)" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
              Add job
            </button>
          </div>
        </div>
      </app-modal>
    }
  `,
})
export class AddJobModal {
  readonly ui = inject(UiStateService);
  readonly data = inject(ReportingDataService);
  private readonly edits = inject(EditsService);

  jobName = '';
  categoryId = '';
  readonly queries = signal<QueryDraft[]>([emptyDraft()]);
  readonly error = signal('');

  constructor() {
    effect(() => {
      const state = this.ui.addJob();
      if (state) this.categoryId = state.categoryId;
    });
  }

  addQueryRow(): void {
    this.queries.update((q) => [...q, emptyDraft()]);
  }

  removeQuery(index: number): void {
    this.queries.update((q) => q.filter((_, i) => i !== index));
  }

  save(defaultCategoryId: string): void {
    const name = this.jobName.trim();
    const categoryId = this.categoryId || defaultCategoryId;
    const validQueries = this.queries().filter((q) => q.name.trim() && q.sqlPreview.trim());

    if (!name) {
      this.error.set('Job name is required.');
      return;
    }
    if (!validQueries.length) {
      this.error.set('At least one query needs a name and SQL text.');
      return;
    }

    this.edits.addJob({
      id: makeJobId(categoryId, name),
      name,
      categoryId,
      queries: validQueries.map((q) => ({
        id: makeQueryId(),
        name: q.name.trim(),
        description: q.description.trim(),
        daoClass: '',
        sqlIdentifier: q.name.trim(),
        status: 'unverified',
        sqlPreview: q.sqlPreview.trim(),
      })),
    });

    this.jobName = '';
    this.categoryId = '';
    this.queries.set([emptyDraft()]);
    this.error.set('');
    this.ui.closeAll();
  }
}
