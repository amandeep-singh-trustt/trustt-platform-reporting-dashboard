import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'aitdp-reporting-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal(this.getInitial());

  toggle(): void {
    this.isDark.update((v) => !v);
    this.apply();
  }

  private getInitial(): boolean {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }

  apply(): void {
    document.documentElement.classList.toggle('dark', this.isDark());
    localStorage.setItem(STORAGE_KEY, this.isDark() ? 'dark' : 'light');
  }
}
