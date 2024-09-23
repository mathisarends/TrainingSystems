import { MoreOptionListItem } from '../../shared/components/more-options-button/more-option-list-item';
import { IconName } from '../../shared/icon/icon-name';

/**
 * Represents  a button in the header.
 * A button can either be a regular button (with `callback`) or a "More Options" button (with `options`).
 */
export interface HeadlineButton {
  /**
   * The icon to display for the button.
   */
  icon: IconName;

  /**
   * Optional: A callback for regular buttons, triggered when the button is clicked.
   * This exists only for regular buttons.
   */
  callback?: () => void;

  /**
   * Optional: A list of options for the button when it’s a "More Options" button.
   * This exists only for buttons that show multiple options.
   */
  options?: MoreOptionListItem[];
}
