import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

/**
 * Service to handle swipe gestures on HTML elements.
 * Provides methods to add and remove swipe listeners for left and right swipes.
 */
@Injectable({
  providedIn: 'root',
})
export class SwipeService {
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
   */
  addSwipeListener(
    element: HTMLElement,
    swipeLeftCallback: () => void,
    swipeRightCallback: () => void
  ) {
    let touchStartX = 0;
    let touchEndX = 0;

    const swipeThreshold = 125;

    const handleTouchStart = (event: TouchEvent) => {
      touchStartX = event.changedTouches[0].screenX;
    };

    const handleTouchMove = (event: TouchEvent) => {
      touchEndX = event.changedTouches[0].screenX;
    };

    const handleTouchEnd = () => {
      if (
        touchEndX < touchStartX &&
        Math.abs(touchStartX - touchEndX) > swipeThreshold
      ) {
        swipeLeftCallback();
      } else if (
        touchEndX > touchStartX &&
        Math.abs(touchEndX - touchStartX) > swipeThreshold
      ) {
        swipeRightCallback();
      }
    };

    const listenerStart = this.renderer.listen(
      element,
      'touchstart',
      handleTouchStart
    );
    const listenerMove = this.renderer.listen(
      element,
      'touchmove',
      handleTouchMove
    );
    const listenerEnd = this.renderer.listen(
      element,
      'touchend',
      handleTouchEnd
    );

    this.listeners.push(listenerStart, listenerMove, listenerEnd);
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
