/**
 * Enum representing the available animation styles for the skeleton component.
 * This enum is used to control the CSS class applied to the skeleton elements,
 * providing different visual animations for loading placeholders.
 */
export enum SkeletonAnimationStyle {
  /**
   * 'PULSE' animation style creates a pulsating effect.
   * Use this style for a subtle loading indicator.
   */
  PULSE = 'pulse',

  /**
   * 'LOADING' animation style creates a sweeping gradient effect.
   * Use this style for a more dynamic loading indicator.
   */
  LOADING = 'loading',
}
