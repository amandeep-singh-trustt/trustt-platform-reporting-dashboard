import { Component, input } from '@angular/core';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [Icon],
  template: `
    <div class="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5 flex flex-col gap-3 transition-all hover:shadow-md hover:-translate-y-0.5">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-slate-500 dark:text-slate-400">{{ label() }}</span>
        <span class="flex items-center justify-center size-9 rounded-lg" [class]="badgeClasses()">
          <app-icon [name]="icon()" [size]="17" />
        </span>
      </div>
      <div class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{{ value() }}</div>
      @if (hint()) {
        <div class="text-xs text-slate-400 dark:text-slate-500">{{ hint() }}</div>
      }
      <span class="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-[0.08]" [class]="dotClasses()"></span>
    </div>
  `,
})
export class StatCard {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input.required<string>();
  readonly hint = input<string>();
  readonly accent = input<'indigo' | 'emerald' | 'violet' | 'amber' | 'slate'>('indigo');

  private static readonly BADGES: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    violet: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  };

  private static readonly DOTS: Record<string, string> = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    violet: 'bg-violet-500',
    amber: 'bg-amber-500',
    slate: 'bg-slate-400',
  };

  badgeClasses(): string {
    return StatCard.BADGES[this.accent()];
  }

  dotClasses(): string {
    return StatCard.DOTS[this.accent()];
  }
}
