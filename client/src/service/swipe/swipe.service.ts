import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SwipeService {
  private renderer: Renderer2;
  private listeners: (() => void)[] = [];

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  addSwipeListener(
    element: HTMLElement,
    swipeLeftCallback: () => void,
    swipeRightCallback: () => void
  ) {
    console.log('🚀 ~ SwipeService ~ element:', element);
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

  removeSwipeListener() {
    this.listeners.forEach((unlisten) => unlisten());
    this.listeners = [];
    console.log('Swipe listener removed');
  }
}
