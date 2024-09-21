import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

/**
 * Service to handle swipe gestures on HTML elements.
 * Provides methods to add and remove swipe listeners for different swipe directions.
 */
@Injectable()
export class SwipeService {
  /**
   * Threshold for horizontal swipe detection
   */
  private swipeThreshold = 125;

  /**
   * Threshold for detecting a diagonal or vertical swipe
   */
  private verticalThreshold = 100;

  private renderer: Renderer2;
  private listeners: (() => void)[] = [];

  /**
   * Constructor to create a SwipeService instance.
   * @param rendererFactory - Factory to create a Renderer2 instance.
   */
  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  /**
   * Adds swipe listeners to the specified element.
   * Listens for touchstart, touchmove, and touchend events to detect swipe gestures.
   * @param element - The HTML element to attach swipe listeners to.
   * @param swipeLeftCallback - Callback function to be invoked on a left swipe.
   * @param swipeRightCallback - Callback function to be invoked on a right swipe.
   * @param swipeDiagonalTopLeftToBottomRightCallback - Callback for diagonal swipe from top left to bottom right.
   * @param swipeDiagonalTopRightToBottomLeftCallback - Callback for diagonal swipe from top right to bottom left.
   */
  addSwipeListener(
    element: HTMLElement,
    swipeLeftCallback: () => void,
    swipeRightCallback: () => void,
    swipeDiagonalTopLeftToBottomRightCallback?: () => void,
    swipeDiagonalTopRightToBottomLeftCallback?: () => void,
  ) {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const handleTouchStart = (event: TouchEvent) => {
      touchStartX = event.changedTouches[0].screenX;
      touchStartY = event.changedTouches[0].screenY;
      touchEndX = touchStartX;
      touchEndY = touchStartY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      touchEndX = event.changedTouches[0].screenX;
      touchEndY = event.changedTouches[0].screenY;
    };

    const handleTouchEnd = () => {
      const deltaX = touchStartX - touchEndX;
      const deltaY = touchStartY - touchEndY;

      if (this.isHorizontalSwipe(deltaX, deltaY)) {
        this.handleHorizontalSwipe(deltaX, swipeLeftCallback, swipeRightCallback);
      }

      // when vertical swipes are not allowed
      if (!swipeDiagonalTopLeftToBottomRightCallback || !swipeDiagonalTopRightToBottomLeftCallback) {
        return;
      }

      if (this.isDiagonalSwipeTopLeftToBottomRight(deltaX, deltaY)) {
        swipeDiagonalTopLeftToBottomRightCallback();
      } else if (this.isDiagonalSwipeTopRightToBottomLeft(deltaX, deltaY)) {
        swipeDiagonalTopRightToBottomLeftCallback();
      }
    };

    this.registerListener(element, 'touchstart', handleTouchStart as EventListener);
    this.registerListener(element, 'touchmove', handleTouchMove as EventListener);
    this.registerListener(element, 'touchend', handleTouchEnd as EventListener);
  }

  /**
   * Handles horizontal swipe direction (left or right).
   * @param deltaX - Difference between start and end X coordinates.
   * @param swipeLeftCallback - Callback function for left swipe.
   * @param swipeRightCallback - Callback function for right swipe.
   */
  private handleHorizontalSwipe(deltaX: number, swipeLeftCallback: () => void, swipeRightCallback: () => void) {
    if (this.isSwipeToLeft(deltaX)) {
      swipeLeftCallback();
    } else {
      swipeRightCallback();
    }
  }

  /**
   * Determines if the swipe is a horizontal swipe.
   */
  private isHorizontalSwipe(deltaX: number, deltaY: number): boolean {
    return this.isOverSwipeThreshold(deltaX) && Math.abs(deltaY) < this.verticalThreshold;
  }

  /**
   * Determines whether the swipe is to the left.
   */
  private isSwipeToLeft(deltaX: number): boolean {
    return deltaX > 0;
  }

  /**
   * Determines if the swipe is a diagonal swipe from top left to bottom right.
   */
  private isDiagonalSwipeTopLeftToBottomRight(deltaX: number, deltaY: number): boolean {
    return this.isOverSwipeThreshold(deltaX) && this.isOverVerticalThreshold(deltaY) && deltaX < 0 && deltaY < 0;
  }

  /**
   * Determines if the swipe is a diagonal swipe from top right to bottom left.
   */
  private isDiagonalSwipeTopRightToBottomLeft(deltaX: number, deltaY: number): boolean {
    return this.isOverSwipeThreshold(deltaX) && this.isOverVerticalThreshold(deltaY) && deltaX > 0 && deltaY < 0;
  }

  /**
   * Determines if the deltaX exceeds the swipe threshold.
   */
  private isOverSwipeThreshold(deltaX: number): boolean {
    return Math.abs(deltaX) > this.swipeThreshold;
  }

  /**
   * Determines if the deltaY exceeds the vertical threshold.
   */
  private isOverVerticalThreshold(deltaY: number): boolean {
    return Math.abs(deltaY) > this.verticalThreshold;
  }

  /**
   * Registers an event listener and stores the unlisten function.
   * @param element - The HTML element to attach the listener to.
   * @param event - The event type to listen for.
   * @param handler - The event handler function.
   */
  private registerListener(element: HTMLElement, event: string, handler: EventListener) {
    const unlisten = this.renderer.listen(element, event, handler);
    this.listeners.push(unlisten);
  }

  /**
   * Removes all registered swipe listeners.
   * Calls each unlisten function to detach the swipe listeners from the element.
   */
  removeSwipeListener() {
    this.listeners.forEach((unlisten) => unlisten());
    this.listeners = [];
  }
}
