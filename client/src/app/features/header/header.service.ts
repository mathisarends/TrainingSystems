import { computed, Injectable, signal } from '@angular/core';
import { IconName } from '../../shared/icon/icon-name';
import { HeadlineInfo } from './headline-info';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  private title = signal<string | null>(null);
  private subTitle = signal<string | undefined>('TYR');
  private iconName = signal<IconName | undefined>(undefined);
  private options = signal<string[]>([]);
  private onButtonClickCallback = signal<(() => void) | undefined>(undefined);

  currentTitle = computed(() => this.title());
  currentSubTitle = computed(() => this.subTitle());
  currentIcon = computed(() => this.iconName());
  currentOptions = computed(() => this.options());
  currentButtonClickCallback = computed(() => this.onButtonClickCallback());

  setHeadlineInfo(headlineInfo: HeadlineInfo) {
    this.title.set(headlineInfo.title);
    this.subTitle.set(headlineInfo.subTitle ?? 'TYR');
    this.iconName.set(headlineInfo.iconName ?? undefined);
    this.options.set(headlineInfo.options || []);
    this.onButtonClickCallback.set(headlineInfo.onButtonClickCallback ?? undefined);
  }

  handleButtonClick() {
    const callback = this.onButtonClickCallback();
    if (callback) {
      callback();
    }
  }
}
