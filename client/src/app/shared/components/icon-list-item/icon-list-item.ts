import { IconName } from '../../icon/icon-name';
import { IconBackgroundColor } from './icon-background-color';

export interface IconListItem {
  /**
   * The text label displayed alongside the icon.
   */
  label: string;

  /**
   * The name of the icon to be displayed.
   */
  iconName: IconName;

  /**
   * The background color of the icon.
   */
  iconBackgroundColor: IconBackgroundColor;

  onItemClicked: () => void | Promise<void>;
}
