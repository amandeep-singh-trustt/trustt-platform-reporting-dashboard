import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../components/icon/icon';
import { StatCard } from '../../components/stat-card/stat-card';
import { OltpDataService } from '../../services/oltp-data.service';

const ACCENTS: Array<'indigo' | 'violet' | 'emerald' | 'amber'> = ['indigo', 'violet', 'emerald', 'amber'];

@Component({
  selector: 'app-oltp-dashboard-page',
  standalone: true,
  imports: [RouterLink, Icon, StatCard],
  template: `
    <div class="flex flex-col gap-6">
      <div class="animate-fade-in-down">
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">OLTP Queries</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">Service-wise queries with SQL, explain plans, and referenced view/staging table definitions.</p>
      </div>

      @if (!oltp.indexLoaded()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (i of [1, 2, 3, 4]; track i) {
            <div class="h-28 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="animate-fade-in-up" style="animation-delay: 0ms">
            <app-stat-card label="Modules" [value]="oltp.modules().length" icon="layout-dashboard" accent="indigo" />
          </div>
          <div class="animate-fade-in-up" style="animation-delay: 60ms">
            <app-stat-card label="DAO Groups" [value]="totalGroups()" icon="database" accent="violet" />
          </div>
          <div class="animate-fade-in-up" style="animation-delay: 120ms">
            <app-stat-card label="Total Queries" [value]="totalQueries()" icon="search" accent="emerald" />
          </div>
          <div class="animate-fade-in-up" style="animation-delay: 180ms">
            <app-stat-card label="Explained" [value]="totalExplained()" icon="activity" accent="amber" />
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">Modules</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (mod of oltp.modules(); track mod.id; let i = $index) {
              <a
                [routerLink]="['/oltp', mod.id]"
                class="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5 flex flex-col gap-3 transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] animate-fade-in-up"
                [style.animation-delay.ms]="i * 40"
              >
                <div class="flex items-center justify-between">
                  <span class="flex items-center justify-center size-10 rounded-lg" [class]="badgeClass(i)">
                    <app-icon name="database" [size]="18" />
                  </span>
                  <app-icon name="chevron-right" [size]="16" class="text-slate-300 dark:text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                </div>
                <div>
                  <div class="font-bold text-slate-900 dark:text-slate-100">{{ mod.name }}</div>
                  <div class="text-sm text-slate-500 dark:text-slate-400">
                    {{ mod.daoGroupCount }} groups &middot; {{ mod.queryCount }} queries
                  </div>
                  <div class="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    {{ mod.explainedCount }} explained, {{ mod.needsReviewCount }} needs review
                  </div>
                </div>
              </a>
            } @empty {
              <p class="text-sm text-slate-500 dark:text-slate-400">No modules found.</p>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class OltpDashboardPage {
  protected readonly oltp = inject(OltpDataService);

  protected readonly totalGroups = computed(() => this.oltp.modules().reduce((n, m) => n + m.daoGroupCount, 0));
  protected readonly totalQueries = computed(() => this.oltp.modules().reduce((n, m) => n + m.queryCount, 0));
  protected readonly totalExplained = computed(() => this.oltp.modules().reduce((n, m) => n + m.explainedCount, 0));

  private static readonly BADGES: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400',
    violet: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
  };

  protected badgeClass(index: number): string {
    return OltpDashboardPage.BADGES[ACCENTS[index % ACCENTS.length]];
  }
}
