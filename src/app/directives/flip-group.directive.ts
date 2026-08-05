import { AfterViewInit, Directive, ElementRef, OnDestroy, inject } from '@angular/core';

// FLIP (First-Last-Invert-Play): when a card grid reorders (via [appDragReorder] rewriting the
// underlying list), Angular moves the tracked-by-id DOM nodes to their new slots instantly — no
// native way to animate a CSS Grid reflow. This watches for that reorder and fakes the animation:
// snapshot each child's old position, let the reorder happen, then transform-offset each child
// back to where it *was* and transition it to zero. Children must carry a stable [data-flip-key].
@Directive({
  selector: '[appFlipGroup]',
  standalone: true,
})
export class FlipGroupDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>).nativeElement;
  private rects = new Map<string, DOMRect>();
  private observer?: MutationObserver;

  ngAfterViewInit(): void {
    this.captureRects();
    this.observer = new MutationObserver(() => this.onMutation());
    this.observer.observe(this.el, { childList: true });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private captureRects(): void {
    this.rects = this.measure();
  }

  private measure(): Map<string, DOMRect> {
    const rects = new Map<string, DOMRect>();
    for (const child of Array.from(this.el.children) as HTMLElement[]) {
      const key = child.getAttribute('data-flip-key');
      if (key) rects.set(key, child.getBoundingClientRect());
    }
    return rects;
  }

  private onMutation(): void {
    const newRects = this.measure();

    for (const child of Array.from(this.el.children) as HTMLElement[]) {
      const key = child.getAttribute('data-flip-key');
      if (!key) continue;
      const oldRect = this.rects.get(key);
      const newRect = newRects.get(key);
      if (!oldRect || !newRect) continue;

      const dx = oldRect.left - newRect.left;
      const dy = oldRect.top - newRect.top;
      if (!dx && !dy) continue;

      child.style.transition = 'none';
      child.style.transform = `translate(${dx}px, ${dy}px)`;
      child.getBoundingClientRect(); // force reflow so the transform above actually applies before the next one
      child.style.transition = 'transform 220ms cubic-bezier(0.2, 0, 0.2, 1)';
      child.style.transform = '';
    }

    this.rects = newRects;
  }
}
