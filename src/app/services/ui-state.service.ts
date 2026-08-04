import { Injectable, signal } from '@angular/core';
import type { QueryContext, ReportingJob } from '../types/reporting.types';

interface AddJobState {
  categoryId: string;
}

interface AddQueryState {
  job: ReportingJob;
}

interface MoveJobState {
  job: ReportingJob;
}

interface RenameJobState {
  job: ReportingJob;
}

@Injectable({ providedIn: 'root' })
export class UiStateService {
  readonly addJob = signal<AddJobState | null>(null);
  readonly addQuery = signal<AddQueryState | null>(null);
  readonly editQuery = signal<QueryContext | null>(null);
  readonly moveJob = signal<MoveJobState | null>(null);
  readonly renameJob = signal<RenameJobState | null>(null);

  openAddJob(categoryId: string): void {
    this.addJob.set({ categoryId });
  }

  openAddQuery(job: ReportingJob): void {
    this.addQuery.set({ job });
  }

  openEditQuery(ctx: QueryContext): void {
    this.editQuery.set(ctx);
  }

  openMoveJob(job: ReportingJob): void {
    this.moveJob.set({ job });
  }

  openRenameJob(job: ReportingJob): void {
    this.renameJob.set({ job });
  }

  closeAll(): void {
    this.addJob.set(null);
    this.addQuery.set(null);
    this.editQuery.set(null);
    this.moveJob.set(null);
    this.renameJob.set(null);
  }
}
