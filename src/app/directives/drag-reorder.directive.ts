import { Directive, HostBinding, HostListener, inject, input, output, signal } from '@angular/core';
import { DragContextService } from '../services/drag-context.service';

export interface ReorderEvent {
  from: number;
  to: number;
}

@Directive({
  selector: '[appDragReorder]',
  standalone: true,
})
export class DragReorderDirective {
  private readonly ctx = inject(DragContextService);

  readonly index = input.required<number>({ alias: 'appDragReorder' });

  // fires continuously while dragging over a new slot, not just on drop — the grid
  // reorders live so surrounding cards visibly shift out of the way (FLIP-animated
  // by app-flip-group on the container).
  readonly hoverReorder = output<ReorderEvent>();

  readonly dragging = signal(false);

  @HostBinding('draggable') readonly draggable = true;
  @HostBinding('class.opacity-40') get isDraggingClass() {
    return this.dragging();
  }
  @HostBinding('class.cursor-grab') readonly cursorGrab = true;

  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent): void {
    this.dragging.set(true);
    this.ctx.draggingIndex.set(this.index());
    // some browsers refuse to start a drag without data set on the transfer object
    event.dataTransfer?.setData('text/plain', '');
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  @HostListener('dragend')
  onDragEnd(): void {
    this.dragging.set(false);
    this.ctx.draggingIndex.set(null);
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';

    const from = this.ctx.draggingIndex();
    const to = this.index();
    if (from !== null && from !== to) {
      this.hoverReorder.emit({ from, to });
      // the dragged item now lives at `to` — keep the shared pointer in sync so the
      // next dragover computes its delta from the item's current slot, not its origin.
      this.ctx.draggingIndex.set(to);
    }
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent): void {
    event.preventDefault();
  }
}
