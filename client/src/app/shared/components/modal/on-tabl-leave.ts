/**
 * Interface to be implemented by components used in modal tabs
 * that require validation before the user leaves the tab.
 */
export interface OnTabLeave {
  /**
   * Hook triggered when a tab is about to be left.
   * Should return:
   * - `true` if navigation is allowed without any issues,
   * - `string` to display a confirmation message,
   */
  onTabLeave(): void | string;
}
