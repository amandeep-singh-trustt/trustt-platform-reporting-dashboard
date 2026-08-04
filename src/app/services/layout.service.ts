import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'aitdp-reporting-sidebar-collapsed';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  readonly sidebarCollapsed = signal(localStorage.getItem(STORAGE_KEY) === '1');

  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
    localStorage.setItem(STORAGE_KEY, this.sidebarCollapsed() ? '1' : '0');
  }
}
