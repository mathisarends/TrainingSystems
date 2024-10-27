import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appSwipe]', // This directive can be used as an attribute on any element
  standalone: true,
})
export class SwipeDirective implements OnInit, OnDestroy {
  @Input() swipeLeft: () => void = () => {};
  @Input() swipeRight: () => void = () => {};
  @Input() swipeDiagonalTopLeftToBottomRight: () => void = () => {};
  @Input() swipeDiagonalTopRightToBottomLeft: () => void = () => {};

  private swipeThreshold = 125;
  private verticalThreshold = 100;

  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchEndX: number = 0;
  private touchEndY: number = 0;

  private listeners: (() => void)[] = [];

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    this.addSwipeListeners();
  }

  ngOnDestroy(): void {
    this.removeSwipeListeners();
  }

  private addSwipeListeners() {
    this.listeners.push(
      this.renderer.listen(this.el.nativeElement, 'touchstart', this.handleTouchStart.bind(this)),
      this.renderer.listen(this.el.nativeElement, 'touchmove', this.handleTouchMove.bind(this)),
      this.renderer.listen(this.el.nativeElement, 'touchend', this.handleTouchEnd.bind(this)),
    );
  }

  private handleTouchStart(event: TouchEvent) {
    const touch = event.changedTouches[0];
    this.touchStartX = touch.screenX;
    this.touchStartY = touch.screenY;
    this.touchEndX = this.touchStartX;
    this.touchEndY = this.touchStartY;
  }

  private handleTouchMove(event: TouchEvent) {
    const touch = event.changedTouches[0];
    this.touchEndX = touch.screenX;
    this.touchEndY = touch.screenY;
  }

  private handleTouchEnd() {
    const deltaX = this.touchStartX - this.touchEndX;
    const deltaY = this.touchStartY - this.touchEndY;

    if (this.isHorizontalSwipe(deltaX, deltaY)) {
      this.handleHorizontalSwipe(deltaX);
    } else if (this.isDiagonalSwipeTopLeftToBottomRight(deltaX, deltaY)) {
      this.swipeDiagonalTopLeftToBottomRight?.();
    } else if (this.isDiagonalSwipeTopRightToBottomLeft(deltaX, deltaY)) {
      this.swipeDiagonalTopRightToBottomLeft?.();
    }
  }

  private handleHorizontalSwipe(deltaX: number) {
    if (this.isSwipeToLeft(deltaX)) {
      this.swipeLeft();
    } else {
      this.swipeRight();
    }
  }

  private isHorizontalSwipe(deltaX: number, deltaY: number): boolean {
    return this.isOverSwipeThreshold(deltaX) && Math.abs(deltaY) < this.verticalThreshold;
  }

  private isSwipeToLeft(deltaX: number): boolean {
    return deltaX > 0;
  }

  private isDiagonalSwipeTopLeftToBottomRight(deltaX: number, deltaY: number): boolean {
    return this.isOverSwipeThreshold(deltaX) && this.isOverVerticalThreshold(deltaY) && deltaX < 0 && deltaY < 0;
  }

  private isDiagonalSwipeTopRightToBottomLeft(deltaX: number, deltaY: number): boolean {
    return this.isOverSwipeThreshold(deltaX) && this.isOverVerticalThreshold(deltaY) && deltaX > 0 && deltaY < 0;
  }

  private isOverSwipeThreshold(deltaX: number): boolean {
    return Math.abs(deltaX) > this.swipeThreshold;
  }

  private isOverVerticalThreshold(deltaY: number): boolean {
    return Math.abs(deltaY) > this.verticalThreshold;
  }

  private removeSwipeListeners() {
    this.listeners.forEach((unlisten) => unlisten());
    this.listeners = [];
  }
}
