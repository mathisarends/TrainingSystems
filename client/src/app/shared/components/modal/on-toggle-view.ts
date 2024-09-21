import { OnConfirm } from './on-confirm';

/**
 * Interface to ensure that a component can handle the secondary button action.
 */
export interface OnToggleView extends OnConfirm {
  /**
   * Handles the action when the secondary button is clicked.
   */
  onToggleView(): void;
}
