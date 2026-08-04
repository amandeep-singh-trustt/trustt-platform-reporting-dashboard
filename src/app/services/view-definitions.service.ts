import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import type { ViewDefinition } from '../types/reporting.types';

@Injectable({ providedIn: 'root' })
export class ViewDefinitionsService {
  private readonly http = inject(HttpClient);
  private readonly defs = signal<Record<string, ViewDefinition>>({});
  readonly loaded = computed(() => Object.keys(this.defs()).length > 0);

  load(): Observable<Record<string, ViewDefinition>> {
    return this.http
      .get<Record<string, ViewDefinition>>('assets/view-definitions.json')
      .pipe(tap((data) => this.defs.set(data)));
  }

  byName(name: string): ViewDefinition | undefined {
    return this.defs()[name];
  }
}
