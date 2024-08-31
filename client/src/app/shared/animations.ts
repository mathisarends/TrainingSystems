import { trigger, state, style, transition, animate } from '@angular/animations';

/**
 * Animation trigger for toggling between collapsed and expanded states.
 *
 * This animation smoothly transitions the height of an element to show or hide
 * its content. It changes from a fully visible state (`expanded`) to a hidden state (`collapsed`)
 * and vice versa, with a sliding and fading effect.
 *
 * @constant
 * @type {AnimationTriggerMetadata}
 * @name toggleCollapseAnimation
 */
export const toggleCollapseAnimation = trigger('toggleCollapse', [
  state('collapsed', style({ height: '0px', overflow: 'hidden', opacity: 0 })),
  state('expanded', style({ height: '*', overflow: 'hidden', opacity: 1 })),
  transition('collapsed <=> expanded', [animate('300ms ease-in-out')]),
]);
