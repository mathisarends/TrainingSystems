import { Injectable } from '@angular/core';
import {
  fromEvent,
  map,
  Observable,
  pairwise,
  switchMap,
  takeUntil,
} from 'rxjs';

/**
 * Represents a swipe event with direction.
 */
interface SwipeEvent {
  direction: 'left' | 'right' | 'up' | 'down';
}

@Injectable({
  providedIn: 'root',
})
export class SwipeService {
  private startX = 0;
  private startY = 0;

  /**
   * Detects swipe gestures on the specified HTML element.
   * @param element The HTML element to attach the swipe detection to.
   * @returns An observable that emits swipe events.
   */
  detectSwipe(element: HTMLElement): Observable<SwipeEvent> {
    return fromEvent<TouchEvent>(element, 'touchstart').pipe(
      switchMap((startEvent: TouchEvent) => {
        this.startX = startEvent.touches[0].clientX;
        this.startY = startEvent.touches[0].clientY;

        return fromEvent<TouchEvent>(element, 'touchmove').pipe(
          map((moveEvent: TouchEvent) => {
            const deltaX = moveEvent.touches[0].clientX - this.startX;
            const deltaY = moveEvent.touches[0].clientY - this.startY;
            return { deltaX, deltaY };
          }),
          pairwise(),
          map(([prev, curr]) => this.getSwipeDirection(prev, curr)),
          takeUntil(fromEvent(element, 'touchend'))
        );
      })
    );
  }

  /**
   * Determines the swipe direction based on the delta values of two consecutive touch events.
   * @param prev The previous touch event deltas.
   * @param curr The current touch event deltas.
   * @returns A swipe event indicating the direction of the swipe.
   */
  private getSwipeDirection(
    prev: { deltaX: number; deltaY: number },
    curr: { deltaX: number; deltaY: number }
  ): SwipeEvent {
    const absX = Math.abs(curr.deltaX - prev.deltaX);
    const absY = Math.abs(curr.deltaY - prev.deltaY);

    if (absX > absY) {
      if (curr.deltaX > prev.deltaX) {
        return { direction: 'right' };
      } else {
        return { direction: 'left' };
      }
    } else {
      if (curr.deltaY > prev.deltaY) {
        return { direction: 'down' };
      } else {
        return { direction: 'up' };
      }
    }
  }
}
