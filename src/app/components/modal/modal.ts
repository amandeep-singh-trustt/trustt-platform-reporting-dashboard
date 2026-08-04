import { Component, HostListener, input, output } from '@angular/core';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [Icon],
  template: `
    <div class="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-[1px] p-4 sm:p-8 animate-fade-in" (click)="close.emit()">
      <div
        (click)="$event.stopPropagation()"
        class="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl my-4 animate-scale-in"
        [class]="widthClass()"
      >
        <div class="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 px-5 py-4">
          <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">{{ title() }}</h2>
          <button
            type="button"
            (click)="close.emit()"
            class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <app-icon name="x" [size]="18" />
          </button>
        </div>
        <div class="p-5">
          <ng-content />
        </div>
      </div>
    </div>
  `,
})
export class Modal {
  readonly title = input.required<string>();
  readonly width = input<'md' | 'lg' | 'xl'>('md');
  readonly close = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }

  widthClass(): string {
    return { md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[this.width()];
  }
}
