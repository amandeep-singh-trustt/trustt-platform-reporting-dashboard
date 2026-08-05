import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReportingDataService } from '../../services/reporting-data.service';
import { StatCard } from '../../components/stat-card/stat-card';
import { Icon } from '../../components/icon/icon';
import { ReportTabs } from '../../components/report-tabs/report-tabs';
import { categoryStyle } from '../../utils/category-style';
import { UiStateService } from '../../services/ui-state.service';
import { OrderService } from '../../services/order.service';
import { DragReorderDirective } from '../../directives/drag-reorder.directive';
import { FlipGroupDirective } from '../../directives/flip-group.directive';
import { applyOrder, reorderIds } from '../../utils/apply-order';
import type { ReportingCategory } from '../../types/reporting.types';

const ORDER_KEY = 'reports-dashboard:categories';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink, StatCard, Icon, ReportTabs, DragReorderDirective, FlipGroupDirective],
  template: `
    <div class="flex flex-col gap-6">
      <div class="flex items-start justify-between gap-4 animate-fade-in-down">
        <div>
          <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Dashboard</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400">Overview of reporting categories, jobs, and queries.</p>
        </div>
        <button
          type="button"
          (click)="ui.openAddJob(data.categories()[0]?.id ?? '')"
          class="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-500/30 hover:bg-indigo-500 transition-colors"
        >
          <app-icon name="plus" [size]="16" />
          <span class="hidden sm:inline">Add job</span>
        </button>
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
          <div class="animate-fade-in-up" style="animation-delay: 0ms">
            <app-stat-card label="Total Categories" [value]="data.summary().totalCategories" icon="layout-dashboard" accent="indigo" />
          </div>
          <div class="animate-fade-in-up" style="animation-delay: 60ms">
            <app-stat-card label="Total Reporting Jobs" [value]="data.summary().totalJobs" icon="database" accent="violet" />
          </div>
          <div class="animate-fade-in-up" style="animation-delay: 120ms">
            <app-stat-card label="Total Queries" [value]="data.summary().totalQueries" icon="search" accent="emerald" />
          </div>
          <div class="animate-fade-in-up" style="animation-delay: 180ms">
            <app-stat-card label="Recently Added Reports" value="—" icon="history" hint="Coming soon" accent="amber" />
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">Categories</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" appFlipGroup>
            @for (category of orderedCategories(); track category.id; let i = $index) {
              <a
                [routerLink]="['/category', category.id]"
                [attr.data-flip-key]="category.id"
                [appDragReorder]="i"
                (hoverReorder)="onReorder($event)"
                class="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5 flex flex-col gap-3 transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] animate-fade-in-up"
                [style.animation-delay.ms]="i * 50"
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
  protected readonly ui = inject(UiStateService);
  protected readonly style = categoryStyle;
  private readonly order = inject(OrderService);

  protected readonly orderedCategories = computed<ReportingCategory[]>(() =>
    applyOrder(this.data.categories(), (c) => c.id, this.order.getOrder(ORDER_KEY)),
  );

  protected queryCount(category: { jobs: { queries: unknown[] }[] }): number {
    return category.jobs.reduce((sum, job) => sum + job.queries.length, 0);
  }

  protected onReorder(event: { from: number; to: number }): void {
    const ids = this.orderedCategories().map((c) => c.id);
    this.order.setOrder(ORDER_KEY, reorderIds(ids, event.from, event.to));
  }
}
