import { MoreOptionListItem } from '../../shared/components/more-options-button/more-option-list-item';
import { IconName } from '../../shared/icon/icon-name';

/**
 * Interface that represents the structure of headline information for the header component.
 * This includes the title, optional subtitle, optional icon, button click callback, and action options.
 */
export interface HeadlineInfo {
  /**
   * The main title of the header.
   * This is a required property and will be displayed as the main heading in the header.
   */
  title: string;

  /**
   * The optional subtitle of the header.
   * Will be replaced with 'TYR' if not set.
   */
  subTitle?: string;

  /**
   * The optional icon name to display in the header.
   * If provided, the icon will be displayed alongside the title or in place of other elements.
   */
  iconName?: IconName;

  /**
   * An optional callback function that is triggered when the associated header button is clicked.
   * This allows for custom actions to be performed when the user interacts with the header.
   */
  onButtonClickCallback?: () => void;

  /**
   * An optional list of action options for the header.
   * This can be used to provide additional actions that the user can select.
   */
  options?: MoreOptionListItem[];
}
