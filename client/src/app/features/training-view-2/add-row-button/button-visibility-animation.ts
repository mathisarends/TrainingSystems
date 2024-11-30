import { animate, state, style, transition, trigger } from '@angular/animations';

/**
 * Animation trigger for showing and hiding the AddRowButton.
 *
 * - `hidden`: The button is completely invisible and scaled down.
 * - `visible`: The button smoothly fades in, scales up, and becomes fully visible.
 */
export const buttonVisibilityAnimation = trigger('buttonVisibility', [
  state(
    'hidden',
    style({
      opacity: 0,
      transform: 'scale(0.8)',
    }),
  ),
  state(
    'visible',
    style({
      opacity: 1,
      transform: 'scale(1)',
    }),
  ),
  transition('hidden <=> visible', [animate('200ms ease-in-out')]),
]);
