import { HeadlineButton } from './headline-button';

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
   * An optional array of buttons to be displayed in the header.
   * If no values are passed the profile picture of the user is displayed.
   */
  buttons?: HeadlineButton[];
}
