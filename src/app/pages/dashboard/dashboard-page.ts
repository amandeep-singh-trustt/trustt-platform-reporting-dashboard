import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReportingDataService } from '../../services/reporting-data.service';
import { StatCard } from '../../components/stat-card/stat-card';
import { Icon } from '../../components/icon/icon';
import { ReportTabs } from '../../components/report-tabs/report-tabs';
import { categoryStyle } from '../../utils/category-style';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink, StatCard, Icon, ReportTabs],
  template: `
    <div class="flex flex-col gap-6">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Dashboard</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">Overview of reporting categories, jobs, and queries.</p>
      </div>

      <app-report-tabs />

      @if (!data.loaded()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (i of [1, 2, 3, 4]; track i) {
            <div class="h-28 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <app-stat-card label="Total Categories" [value]="data.summary().totalCategories" icon="layout-dashboard" accent="indigo" />
          <app-stat-card label="Total Reporting Jobs" [value]="data.summary().totalJobs" icon="database" accent="violet" />
          <app-stat-card label="Total Queries" [value]="data.summary().totalQueries" icon="search" accent="emerald" />
          <app-stat-card label="Recently Added Reports" value="—" icon="history" hint="Coming soon" accent="amber" />
        </div>

        <div class="flex flex-col gap-3">
          <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">Categories</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (category of data.categories(); track category.id) {
              <a
                [routerLink]="['/category', category.id]"
                class="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5 flex flex-col gap-3 transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md hover:-translate-y-0.5"
              >
                <span class="absolute inset-y-0 left-0 w-1" [class]="style(category.id).bar"></span>
                <div class="flex items-center justify-between pl-1.5">
                  <span class="flex items-center justify-center size-10 rounded-lg" [class]="style(category.id).badge">
                    <app-icon [name]="style(category.id).icon" [size]="18" />
                  </span>
                  <app-icon name="chevron-right" [size]="16" class="text-slate-300 dark:text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                </div>
                <div class="pl-1.5">
                  <div class="font-bold text-slate-900 dark:text-slate-100">{{ category.name }}</div>
                  <div class="text-sm text-slate-500 dark:text-slate-400">
                    {{ category.jobs.length }} jobs &middot; {{ queryCount(category) }} queries
                  </div>
                </div>
              </a>
            } @empty {
              <p class="text-sm text-slate-500 dark:text-slate-400">No categories found.</p>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardPage {
  protected readonly data = inject(ReportingDataService);
  protected readonly style = categoryStyle;

  protected queryCount(category: { jobs: { queries: unknown[] }[] }): number {
    return category.jobs.reduce((sum, job) => sum + job.queries.length, 0);
  }
}
