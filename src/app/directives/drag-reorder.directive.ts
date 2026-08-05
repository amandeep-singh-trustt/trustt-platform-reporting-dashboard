import { Directive, HostBinding, HostListener, input, output, signal } from '@angular/core';

export interface ReorderEvent {
  from: number;
  to: number;
}

@Directive({
  selector: '[appDragReorder]',
  standalone: true,
})
export class DragReorderDirective {
  readonly index = input.required<number>({ alias: 'appDragReorder' });
  readonly reordered = output<ReorderEvent>();

  readonly dragging = signal(false);
  readonly dragOver = signal(false);

  @HostBinding('draggable') readonly draggable = true;
  @HostBinding('class.opacity-40') get isDraggingClass() {
    return this.dragging();
  }
  @HostBinding('class.ring-2') get isDragOverClass() {
    return this.dragOver();
  }
  @HostBinding('class.ring-indigo-400') get isDragOverRing() {
    return this.dragOver();
  }
  @HostBinding('class.cursor-grab') readonly cursorGrab = true;

  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent): void {
    this.dragging.set(true);
    event.dataTransfer?.setData('text/plain', String(this.index()));
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  @HostListener('dragend')
  onDragEnd(): void {
    this.dragging.set(false);
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    this.dragOver.set(true);
  }

  @HostListener('dragleave')
  onDragLeave(): void {
    this.dragOver.set(false);
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    const from = Number(event.dataTransfer?.getData('text/plain'));
    const to = this.index();
    if (!Number.isNaN(from) && from !== to) {
      this.reordered.emit({ from, to });
    }
  }
}
