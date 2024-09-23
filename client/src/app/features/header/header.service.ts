import { Injectable, signal } from '@angular/core';
import { HeadlineButton } from './headline-button';
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

  buttons = signal<HeadlineButton[]>([]);

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
    this.buttons.set(headlineInfo.buttons || []);
    this.loading.set(false);
  }

  /**
   * Sets the header to a loading state. This can be called to indicate that the header is processing an action.
   */
  setLoading() {
    this.loading.set(true);
  }
}
