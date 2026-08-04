import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../icon/icon';

interface ReportTab {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-report-tabs',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, Icon],
  template: `
    <div class="flex items-center gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
      @for (tab of tabs; track tab.path) {
        <a
          [routerLink]="tab.path"
          routerLinkActive
          #rla="routerLinkActive"
          class="flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors"
          [class]="rla.isActive
            ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400'
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700'"
        >
          <app-icon [name]="tab.icon" [size]="15" />
          {{ tab.label }}
        </a>
      }
    </div>
  `,
})
export class ReportTabs {
  readonly tabs: ReportTab[] = [
    { label: 'EOD/BOD Reports', path: '/category/eod-bod', icon: 'sunrise' },
    { label: 'Day Time Reports', path: '/category/daytime', icon: 'sun' },
    { label: 'On Demand Reports', path: '/category/on-demand', icon: 'mouse-pointer-click' },
    { label: 'Bank Requirement/Reconciliation', path: '/category/bank-recon', icon: 'landmark' },
  ];
}
