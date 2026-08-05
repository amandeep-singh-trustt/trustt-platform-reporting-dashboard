import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'aitdp-reporting-grid-order';

function loadFromStorage(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly state = signal<Record<string, string[]>>(loadFromStorage());

  getOrder(key: string): string[] | undefined {
    return this.state()[key];
  }

  setOrder(key: string, ids: string[]): void {
    this.state.update((s) => ({ ...s, [key]: ids }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state()));
  }

  clearOrder(key: string): void {
    this.state.update((s) => {
      const next = { ...s };
      delete next[key];
      return next;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state()));
  }
}
