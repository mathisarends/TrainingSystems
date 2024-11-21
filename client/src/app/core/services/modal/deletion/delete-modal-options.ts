import { BasicInfoModalOptions } from '../basic-info/basic-info-modal-options';

export interface DeleteModalModalOptions extends BasicInfoModalOptions {
  /**
   * A keyword that must be entered to confirm the deletion action.
   * This ensures the user deliberately acknowledges the consequences.
   */
  deletionKeyWord: string;
}
