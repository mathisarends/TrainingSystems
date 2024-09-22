import { Injectable, signal } from '@angular/core';
import { IconName } from '../../shared/icon/icon-name';
import { HeadlineInfo } from './headline-info';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  title = signal<string>('Training');
  subTitle = signal<string>('TYR');
  iconName = signal<IconName | undefined>(undefined);
  options = signal<string[]>([]);
  onButtonClickCallback = signal<(() => void) | undefined>(undefined);
  loading = signal<boolean>(false);

  setHeadlineInfo(headlineInfo: HeadlineInfo) {
    this.title.set(headlineInfo.title);
    this.subTitle.set(headlineInfo.subTitle ?? 'TYR');
    this.iconName.set(headlineInfo.iconName ?? undefined);
    this.options.set(headlineInfo.options || []);
    this.onButtonClickCallback.set(headlineInfo.onButtonClickCallback ?? undefined);
    this.loading.set(false);
  }

  setLoading() {
    this.loading.set(true);
  }

  handleButtonClick() {
    const callback = this.onButtonClickCallback();
    if (callback) {
      callback();
    }
  }
}
