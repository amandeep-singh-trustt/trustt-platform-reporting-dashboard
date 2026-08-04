import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ReportingCategory, ReportingDataset } from '../types/reporting.types';

@Injectable({ providedIn: 'root' })
export class ReportingDataService {
  private readonly http = inject(HttpClient);

  private readonly dataset = signal<ReportingDataset | null>(null);
  readonly loaded = computed(() => this.dataset() !== null);
  readonly categories = computed<ReportingCategory[]>(() => this.dataset()?.categories ?? []);
  readonly summary = computed(
    () => this.dataset()?.summary ?? { totalCategories: 0, totalJobs: 0, totalQueries: 0 },
  );

  load(): Observable<ReportingDataset> {
    return this.http
      .get<ReportingDataset>('assets/mock-data.json')
      .pipe(tap((data) => this.dataset.set(data)));
  }

  categoryById(id: string): ReportingCategory | undefined {
    return this.categories().find((c) => c.id === id);
  }
}
