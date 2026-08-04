import { Component, inject } from '@angular/core';
import { Icon } from '../../components/icon/icon';
import { EditsService } from '../../services/edits.service';
import { ReportingDataService } from '../../services/reporting-data.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [Icon],
  template: `
    <div class="max-w-xl flex flex-col gap-6">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">Local data &amp; connections.</p>
      </div>

      <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <h2 class="text-sm font-bold text-slate-900 dark:text-slate-100">Local edits</h2>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Added jobs, new queries, explain-plan updates and category moves are saved in this browser only.
          @if (edits.editCount() > 0) {
            <span class="font-semibold text-indigo-600 dark:text-indigo-400">{{ edits.editCount() }} unsaved {{ edits.editCount() === 1 ? 'change' : 'changes' }}</span>.
          } @else {
            No local changes yet.
          }
        </p>
        <div class="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            (click)="exportJson()"
            class="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            <app-icon name="download" [size]="15" /> Export JSON
          </button>
          <button
            type="button"
            [disabled]="edits.editCount() === 0"
            (click)="resetEdits()"
            class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <app-icon name="trash" [size]="15" /> Reset local edits
          </button>
        </div>
        <p class="mt-3 text-xs text-slate-400">
          Export downloads the merged dataset as JSON — replace <code class="font-mono">public/assets/mock-data.json</code> with it and commit to make edits permanent for everyone.
        </p>
      </div>
    </div>
  `,
})
export class SettingsPage {
  protected readonly edits = inject(EditsService);
  private readonly data = inject(ReportingDataService);

  exportJson(): void {
    const dataset = this.data.exportDataset();
    const blob = new Blob([JSON.stringify(dataset, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mock-data.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  resetEdits(): void {
    if (confirm('Discard all local edits? This cannot be undone.')) {
      this.edits.resetAll();
    }
  }
}
