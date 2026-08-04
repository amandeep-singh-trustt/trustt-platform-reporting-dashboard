import { Component } from '@angular/core';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  template: `
    <div class="max-w-xl">
      <h1 class="text-xl font-semibold mb-1">Settings</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">Coming in a later phase.</p>
      <div class="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-sm text-slate-400">
        Data source connections, notification preferences, and role management will live here.
      </div>
    </div>
  `,
})
export class SettingsPage {}
