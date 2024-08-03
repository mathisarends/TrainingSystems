import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

/**
 * Service to handle swipe gestures on HTML elements.
 * Provides methods to add and remove swipe listeners for different swipe directions.
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
   * @param swipeDiagonalTopLeftToBottomRightCallback - Callback for diagonal swipe from top left to bottom right.
   * @param swipeDiagonalTopRightToBottomLeftCallback - Callback for diagonal swipe from top right to bottom left.
   */
  addSwipeListener(
    element: HTMLElement,
    swipeLeftCallback: () => void,
    swipeRightCallback: () => void,
    swipeDiagonalTopLeftToBottomRightCallback?: () => void,
    swipeDiagonalTopRightToBottomLeftCallback?: () => void
  ) {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const swipeThreshold = 125; // Threshold for horizontal swipe detection
    const verticalThreshold = 100; // Threshold for detecting a diagonal or vertical swipe

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

    //TOOD: horicontal swipes implementieren

    const handleTouchEnd = () => {
      const deltaX = touchStartX - touchEndX;
      const deltaY = touchStartY - touchEndY;

      const isHorizontalSwipe =
        Math.abs(deltaX) > swipeThreshold &&
        Math.abs(deltaY) < verticalThreshold;

      // Der hier ist gefixt fixe den anderen auch
      const isDiagonalSwipeTopLeftToBottomRight =
        Math.abs(deltaX) > swipeThreshold &&
        Math.abs(deltaY) > verticalThreshold &&
        deltaX < 0 &&
        deltaY < 0;

      const isDiagonalSwipeTopRightToBottomLeft =
        deltaX > swipeThreshold &&
        Math.abs(deltaY) > verticalThreshold &&
        deltaX > 0 &&
        deltaY < 0;

      if (isHorizontalSwipe) {
        if (deltaX > 0) {
          swipeLeftCallback();
        } else {
          swipeRightCallback();
        }
        // TODO: nur der hier wird gehitten unabhängig
      } else if (
        isDiagonalSwipeTopLeftToBottomRight &&
        swipeDiagonalTopLeftToBottomRightCallback
      ) {
        swipeDiagonalTopLeftToBottomRightCallback();
      } else if (
        isDiagonalSwipeTopRightToBottomLeft &&
        swipeDiagonalTopRightToBottomLeftCallback
      ) {
        swipeDiagonalTopRightToBottomLeftCallback();
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
