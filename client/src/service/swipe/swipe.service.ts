import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SwipeService {
  private renderer: Renderer2;

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

    const swipeThreshold = 100;

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

    this.renderer.listen(element, 'touchstart', handleTouchStart);
    this.renderer.listen(element, 'touchmove', handleTouchMove);
    this.renderer.listen(element, 'touchend', handleTouchEnd);
  }
}
