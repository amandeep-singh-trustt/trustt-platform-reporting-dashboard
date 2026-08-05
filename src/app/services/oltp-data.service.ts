import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import type { OltpDaoGroup, OltpIndex, OltpModule, OltpModuleSummary } from '../types/reporting.types';
import { EditsService } from './edits.service';
import { mergeOltpEdits } from '../utils/merge-oltp-edits';

@Injectable({ providedIn: 'root' })
export class OltpDataService {
  private readonly http = inject(HttpClient);
  private readonly edits = inject(EditsService);

  private readonly index = signal<OltpModuleSummary[]>([]);
  private readonly rawModules = signal<Map<string, OltpModule>>(new Map());

  readonly indexLoaded = computed(() => this.index().length > 0);
  readonly modules = computed(() => this.index());

  loadIndex(): Observable<OltpIndex> {
    return this.http
      .get<OltpIndex>('assets/oltp/index.json')
      .pipe(tap((data) => this.index.set(data.modules)));
  }

  loadModule(id: string): Observable<OltpModule> {
    const cached = this.rawModules().get(id);
    if (cached) return of(cached);
    return this.http
      .get<OltpModule>(`assets/oltp/${id}.json`)
      .pipe(tap((data) => this.rawModules.update((m) => new Map(m).set(id, data))));
  }

  isModuleLoaded(id: string): boolean {
    return this.rawModules().has(id);
  }

  moduleSummary(id: string): OltpModuleSummary | undefined {
    return this.index().find((m) => m.id === id);
  }

  daoGroups(moduleId: string): OltpDaoGroup[] {
    const mod = this.rawModules().get(moduleId);
    if (!mod) return [];
    return mergeOltpEdits(mod.daoGroups, {
      queryOverrides: this.edits.queryOverrides(),
      deletedQueryIds: this.edits.deletedQueryIds(),
    });
  }

  daoGroupById(moduleId: string, daoGroupId: string): OltpDaoGroup | undefined {
    return this.daoGroups(moduleId).find((g) => g.id === daoGroupId);
  }
}
