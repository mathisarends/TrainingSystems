import { IconName } from '../../shared/icon/icon-name';

/**
 * Interface representing a navigation item in the mobile navigation bar.
 */
export interface NavItem {
  /**
   * The label displayed for the navigation item.
   */
  label: string;

  /**
   * The route path associated with the navigation item.
   * Clicking the item navigates to this route.
   */
  route: string;

  /**
   * The icon associated with the navigation item, represented by the `IconName` enumeration.
   */
  icon: IconName;
}
