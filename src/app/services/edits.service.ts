import { Injectable, computed, signal } from '@angular/core';
import type { QueryStatus, ReportingJob, SqlQuery } from '../types/reporting.types';

const STORAGE_KEY = 'aitdp-reporting-edits';

export interface QueryOverride {
  name?: string;
  description?: string;
  sqlPreview?: string;
  explainPlan?: string;
  status?: QueryStatus;
}

export interface EditsState {
  newJobs: ReportingJob[];
  newQueriesByJob: Record<string, SqlQuery[]>;
  queryOverrides: Record<string, QueryOverride>;
  jobCategoryMoves: Record<string, string>;
}

function emptyState(): EditsState {
  return { newJobs: [], newQueriesByJob: {}, queryOverrides: {}, jobCategoryMoves: {} };
}

function loadFromStorage(): EditsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    return { ...emptyState(), ...JSON.parse(raw) };
  } catch {
    return emptyState();
  }
}

@Injectable({ providedIn: 'root' })
export class EditsService {
  private readonly state = signal<EditsState>(loadFromStorage());

  readonly newJobs = computed(() => this.state().newJobs);
  readonly queryOverrides = computed(() => this.state().queryOverrides);
  readonly newQueriesByJob = computed(() => this.state().newQueriesByJob);
  readonly jobCategoryMoves = computed(() => this.state().jobCategoryMoves);

  readonly editCount = computed(() => {
    const s = this.state();
    return (
      s.newJobs.length +
      Object.keys(s.queryOverrides).length +
      Object.values(s.newQueriesByJob).reduce((n, arr) => n + arr.length, 0) +
      Object.keys(s.jobCategoryMoves).length
    );
  });

  addJob(job: ReportingJob): void {
    this.mutate((s) => ({ ...s, newJobs: [...s.newJobs, job] }));
  }

  addQueryToJob(jobId: string, query: SqlQuery): void {
    this.mutate((s) => ({
      ...s,
      newQueriesByJob: {
        ...s.newQueriesByJob,
        [jobId]: [...(s.newQueriesByJob[jobId] ?? []), query],
      },
    }));
  }

  updateQuery(queryId: string, patch: QueryOverride): void {
    this.mutate((s) => ({
      ...s,
      queryOverrides: { ...s.queryOverrides, [queryId]: { ...s.queryOverrides[queryId], ...patch } },
    }));
  }

  moveJob(jobId: string, categoryId: string): void {
    this.mutate((s) => ({
      ...s,
      jobCategoryMoves: { ...s.jobCategoryMoves, [jobId]: categoryId },
    }));
  }

  resetAll(): void {
    this.state.set(emptyState());
    localStorage.removeItem(STORAGE_KEY);
  }

  private mutate(fn: (s: EditsState) => EditsState): void {
    const next = fn(this.state());
    this.state.set(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
}
