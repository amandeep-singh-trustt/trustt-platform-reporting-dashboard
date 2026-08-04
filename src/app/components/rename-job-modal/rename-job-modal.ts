import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Modal } from '../modal/modal';
import { UiStateService } from '../../services/ui-state.service';
import { EditsService } from '../../services/edits.service';

@Component({
  selector: 'app-rename-job-modal',
  standalone: true,
  imports: [Modal, FormsModule],
  template: `
    @if (ui.renameJob(); as state) {
      <app-modal title="Rename job" width="md" (close)="ui.closeAll()">
        <div class="flex flex-col gap-4">
          <label class="flex flex-col gap-1">
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Job name *</span>
            <input
              type="text"
              [(ngModel)]="name"
              (keydown.enter)="save(state.job.id)"
              class="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </label>

          @if (error()) {
            <p class="text-sm text-rose-600 dark:text-rose-400">{{ error() }}</p>
          }

          <div class="flex justify-end gap-2 pt-2">
            <button type="button" (click)="ui.closeAll()" class="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
              Cancel
            </button>
            <button type="button" (click)="save(state.job.id)" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
              Save
            </button>
          </div>
        </div>
      </app-modal>
    }
  `,
})
export class RenameJobModal {
  readonly ui = inject(UiStateService);
  private readonly edits = inject(EditsService);

  name = '';
  readonly error = signal('');

  constructor() {
    effect(() => {
      const state = this.ui.renameJob();
      if (state) this.name = state.job.name;
    });
  }

  save(jobId: string): void {
    const name = this.name.trim();
    if (!name) {
      this.error.set('Job name is required.');
      return;
    }
    this.edits.updateJob(jobId, { name });
    this.error.set('');
    this.ui.closeAll();
  }
}
