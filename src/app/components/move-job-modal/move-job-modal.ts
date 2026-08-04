import { Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Modal } from '../modal/modal';
import { Icon } from '../icon/icon';
import { UiStateService } from '../../services/ui-state.service';
import { EditsService } from '../../services/edits.service';
import { ReportingDataService } from '../../services/reporting-data.service';
import { categoryStyle } from '../../utils/category-style';

@Component({
  selector: 'app-move-job-modal',
  standalone: true,
  imports: [Modal, Icon, FormsModule],
  template: `
    @if (ui.moveJob(); as state) {
      <app-modal title="Move job to another category" width="md" (close)="ui.closeAll()">
        <div class="flex flex-col gap-4">
          <p class="text-sm text-slate-500 dark:text-slate-400">
            Moving <span class="font-semibold text-slate-900 dark:text-slate-100">{{ state.job.name }}</span>
          </p>

          <div class="flex flex-col gap-2">
            @for (c of data.categories(); track c.id) {
              <label
                class="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors"
                [class]="targetId === c.id
                  ? 'border-indigo-400 bg-indigo-50 dark:border-indigo-500/50 dark:bg-indigo-500/10'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
              >
                <input type="radio" name="targetCategory" [value]="c.id" [(ngModel)]="targetId" class="accent-indigo-600" />
                <span class="flex items-center justify-center size-7 rounded-lg" [class]="style(c.id).badge">
                  <app-icon [name]="style(c.id).icon" [size]="14" />
                </span>
                <span class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ c.name }}</span>
                @if (c.id === state.job.categoryId) {
                  <span class="ml-auto text-xs text-slate-400">current</span>
                }
              </label>
            }
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button type="button" (click)="ui.closeAll()" class="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
              Cancel
            </button>
            <button
              type="button"
              [disabled]="targetId === state.job.categoryId"
              (click)="save(state.job.id)"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Move job
            </button>
          </div>
        </div>
      </app-modal>
    }
  `,
})
export class MoveJobModal {
  readonly ui = inject(UiStateService);
  readonly data = inject(ReportingDataService);
  private readonly edits = inject(EditsService);
  protected readonly style = categoryStyle;

  targetId = '';

  constructor() {
    effect(() => {
      const state = this.ui.moveJob();
      if (state) this.targetId = state.job.categoryId;
    });
  }

  save(jobId: string): void {
    this.edits.moveJob(jobId, this.targetId);
    this.ui.closeAll();
  }
}
