import { Injectable, signal } from '@angular/core';
import { QueryContext } from '../types/reporting.types';

@Injectable({ providedIn: 'root' })
export class SelectedQueryService {
  readonly context = signal<QueryContext | null>(null);

  open(context: QueryContext): void {
    this.context.set(context);
  }

  close(): void {
    this.context.set(null);
  }
}
