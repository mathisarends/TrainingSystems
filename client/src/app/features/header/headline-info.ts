import { IconName } from '../../shared/icon/icon-name';

export interface HeadlineInfo {
  title: string;
  subTitle?: string;
  iconName?: IconName;
  onButtonClickCallback?: () => void;
  options: string[];
}
