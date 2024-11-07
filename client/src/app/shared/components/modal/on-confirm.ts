import { Observable } from 'rxjs';

/**
 * Interface to ensure that a component can handle the primary button action.
 */
export interface OnConfirm {
  /**
   * Handles the action when the primary button is clicked.
   */
  onConfirm(): Observable<void> | void;
}
