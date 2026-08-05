import { Injectable, signal } from '@angular/core';

// ponytail: single shared "currently dragged index" — dataTransfer.getData() isn't readable
// during dragover (browser security restriction), so sibling directive instances need a shared
// source instead of reading it off the native drag event.
@Injectable({ providedIn: 'root' })
export class DragContextService {
  readonly draggingIndex = signal<number | null>(null);
}
