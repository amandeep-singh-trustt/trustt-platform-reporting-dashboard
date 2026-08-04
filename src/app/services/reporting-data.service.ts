import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ReportingCategory, ReportingDataset } from '../types/reporting.types';
import { EditsService } from './edits.service';
import { mergeEdits } from '../utils/merge-edits';

@Injectable({ providedIn: 'root' })
export class ReportingDataService {
  private readonly http = inject(HttpClient);
  private readonly edits = inject(EditsService);

  private readonly dataset = signal<ReportingDataset | null>(null);
  readonly loaded = computed(() => this.dataset() !== null);

  readonly categories = computed<ReportingCategory[]>(() => {
    const base = this.dataset()?.categories ?? [];
    return mergeEdits(base, {
      newJobs: this.edits.newJobs(),
      newQueriesByJob: this.edits.newQueriesByJob(),
      queryOverrides: this.edits.queryOverrides(),
      jobOverrides: this.edits.jobOverrides(),
      jobCategoryMoves: this.edits.jobCategoryMoves(),
      deletedQueryIds: this.edits.deletedQueryIds(),
    });
  });

  readonly summary = computed(() => {
    const categories = this.categories();
    const totalJobs = categories.reduce((n, c) => n + c.jobs.length, 0);
    const totalQueries = categories.reduce((n, c) => n + c.jobs.reduce((m, j) => m + j.queries.length, 0), 0);
    return { totalCategories: categories.length, totalJobs, totalQueries };
  });

  load(): Observable<ReportingDataset> {
    return this.http
      .get<ReportingDataset>('assets/mock-data.json')
      .pipe(tap((data) => this.dataset.set(data)));
  }

  categoryById(id: string): ReportingCategory | undefined {
    return this.categories().find((c) => c.id === id);
  }

  exportDataset(): ReportingDataset {
    return {
      generatedAt: new Date().toISOString(),
      summary: this.summary(),
      categories: this.categories(),
    };
  }
}
