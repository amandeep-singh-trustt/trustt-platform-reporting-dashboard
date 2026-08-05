import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { Icon } from '../../components/icon/icon';
import { QueryCard } from '../../components/query-card/query-card';
import { OltpDataService } from '../../services/oltp-data.service';
import type { ReportingCategory, ReportingJob, SqlQuery } from '../../types/reporting.types';

@Component({
  selector: 'app-oltp-group-detail-page',
  standalone: true,
  imports: [Icon, QueryCard, RouterLink],
  template: `
    @if (moduleSummary(); as mod) {
      @if (group(); as g) {
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 animate-fade-in-down">
            <a [routerLink]="['/oltp', moduleId()]" class="hover:text-slate-900 dark:hover:text-slate-100">{{ mod.name }}</a>
            <app-icon name="chevron-right" [size]="12" />
            <span class="text-slate-900 dark:text-slate-100 font-mono">{{ g.name }}</span>
          </div>

          <div class="flex items-center gap-3 animate-fade-in-down">
            <span class="flex items-center justify-center size-11 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
              <app-icon name="database" [size]="20" />
            </span>
            <div class="min-w-0">
              <h1 class="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 truncate">{{ g.name }}</h1>
              <p class="truncate font-mono text-xs text-slate-400 dark:text-slate-500" [title]="g.daoClass">{{ g.daoClass }}</p>
            </div>
          </div>

          <div class="relative">
            <span class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
              <app-icon name="filter" [size]="14" />
            </span>
            <input
              type="text"
              [value]="queryFilter()"
              (input)="queryFilter.set($any($event.target).value)"
              placeholder="Filter queries…"
              class="w-72 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          <div class="flex flex-col gap-2">
            @for (query of filteredQueries(); track query.id; let i = $index) {
              <div class="animate-fade-in-up" [style.animation-delay.ms]="(i % 10) * 25">
                <app-query-card [query]="query" [job]="pseudoJob(g.id, g.name)" [category]="pseudoCategory(mod.id, mod.name)" />
              </div>
            } @empty {
              <div class="flex flex-col items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-10 text-slate-400 dark:text-slate-500">
                <app-icon name="inbox" [size]="24" />
                <p class="text-sm">No queries match your filter</p>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="flex flex-col items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-10 text-slate-400 dark:text-slate-500">
          <app-icon name="inbox" [size]="24" />
          <p class="text-sm">Unknown DAO group</p>
        </div>
      }
    }
  `,
})
export class OltpGroupDetailPage {
  private readonly route = inject(ActivatedRoute);
  protected readonly oltp = inject(OltpDataService);

  readonly moduleId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('moduleId') ?? '')),
    { initialValue: '' },
  );
  readonly daoGroupId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('daoGroupId') ?? '')),
    { initialValue: '' },
  );

  readonly moduleSummary = computed(() => this.oltp.moduleSummary(this.moduleId()));
  readonly group = computed(() => this.oltp.daoGroupById(this.moduleId(), this.daoGroupId()));

  readonly queryFilter = signal('');

  readonly filteredQueries = computed<SqlQuery[]>(() => {
    const queries = this.group()?.queries ?? [];
    const term = this.queryFilter().trim().toLowerCase();
    if (!term) return queries;
    return queries.filter((q) => q.name.toLowerCase().includes(term));
  });

  // QueryCard/QueryDrawer/EditQueryModal are typed on ReportingJob/ReportingCategory — these
  // lightweight objects satisfy that shape so the existing components work unmodified.
  pseudoJob(groupId: string, groupName: string): ReportingJob {
    return { id: groupId, name: groupName, categoryId: this.moduleId(), queries: this.group()?.queries ?? [] };
  }

  pseudoCategory(moduleId: string, moduleName: string): ReportingCategory {
    return { id: moduleId, name: moduleName, jobs: [] };
  }

  constructor() {
    effect(() => {
      const id = this.moduleId();
      if (id) this.oltp.loadModule(id).subscribe();
    });
  }
}
