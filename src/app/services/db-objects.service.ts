import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import type { DbObjectDefinition } from '../types/reporting.types';
import { EditsService } from './edits.service';

@Injectable({ providedIn: 'root' })
export class DbObjectsService {
  private readonly http = inject(HttpClient);
  private readonly edits = inject(EditsService);

  private readonly base = signal<Record<string, DbObjectDefinition>>({});
  readonly loaded = computed(() => Object.keys(this.base()).length > 0);

  readonly all = computed<Record<string, DbObjectDefinition>>(() => {
    const merged = { ...this.base() };
    for (const [name, patch] of Object.entries(this.edits.dbObjectOverrides())) {
      const existing: DbObjectDefinition = merged[name] ?? {
        name,
        kind: patch.kind ?? 'view',
        sourceFile: null,
        definition: null,
      };
      merged[name] = { ...existing, ...patch };
    }
    return merged;
  });

  load(): Observable<Record<string, DbObjectDefinition>> {
    return this.http
      .get<Record<string, DbObjectDefinition>>('assets/db-object-definitions.json')
      .pipe(tap((data) => this.base.set(data)));
  }

  byName(name: string): DbObjectDefinition | undefined {
    return this.all()[name];
  }
}
