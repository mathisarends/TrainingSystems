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

    const swipeThreshold = 125; // Adjusted threshold for swipe detection

    const handleTouchStart = (event: TouchEvent) => {
      touchStartX = event.changedTouches[0].screenX;
      touchEndX = touchStartX; // Initialize touchEndX to the same value as touchStartX
    };

    const handleTouchMove = (event: TouchEvent) => {
      touchEndX = event.changedTouches[0].screenX; // Update touchEndX during move
    };

    const handleTouchEnd = () => {
      const swipeDistance = touchStartX - touchEndX;

      if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
          swipeLeftCallback();
        } else {
          swipeRightCallback();
        }
      }
    };

    this.registerListener(
      element,
      'touchstart',
      handleTouchStart as EventListener
    );
    this.registerListener(
      element,
      'touchmove',
      handleTouchMove as EventListener
    );
    this.registerListener(element, 'touchend', handleTouchEnd as EventListener);
  }

  /**
   * Registers an event listener and stores the unlisten function.
   * @param element - The HTML element to attach the listener to.
   * @param event - The event type to listen for.
   * @param handler - The event handler function.
   */
  private registerListener(
    element: HTMLElement,
    event: string,
    handler: EventListener
  ) {
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
