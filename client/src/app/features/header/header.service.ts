import { Injectable, signal } from '@angular/core';
import { IconName } from '../../shared/icon/icon-name';
import { HeadlineInfo } from './headline-info';

/**
 * Service to manage and update the header information for the application.
 * This includes managing title, subtitle, icons, options, button actions, and loading states.
 */
@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  /**
   * Stores the current title of the header.
   */
  title = signal<string>('Training');

  /**
   * Holds the current subtitle of the header.
   */
  subTitle = signal<string>('TYR');

  /**
   * Holds the icon name for the header, if any.
   * Can be undefined if no icon is set.
   */
  iconName = signal<IconName | undefined>(undefined);

  /**
   * Holds the list of options for additional actions in the header.
   */
  options = signal<string[]>([]);

  /**
   * Signal that stores the callback function for handling button clicks in the header.
   * Can be undefined if no callback is provided.
   */
  onButtonClickCallback = signal<(() => void) | undefined>(undefined);

  /**
   * Signal that represents whether the header is in a loading state.
   */
  loading = signal<boolean>(false);

  /**
   * Updates the header information such as the title, subtitle, icon, options, and button callback.
   * Also stops the loading state by setting the `loading` signal to `false`.
   *
   * @param headlineInfo - The object containing the updated headline information.
   */
  setHeadlineInfo(headlineInfo: HeadlineInfo) {
    this.title.set(headlineInfo.title);
    this.subTitle.set(headlineInfo.subTitle ?? 'TYR');
    this.iconName.set(headlineInfo.iconName ?? undefined);
    this.options.set(headlineInfo.options || []);
    this.onButtonClickCallback.set(headlineInfo.onButtonClickCallback ?? undefined);
    this.loading.set(false);
  }

  /**
   * Sets the header to a loading state. This can be called to indicate that the header is processing an action.
   */
  setLoading() {
    this.loading.set(true);
  }
}
