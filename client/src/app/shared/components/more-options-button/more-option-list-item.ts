import { IconName } from '../../icon/icon-name';

export interface MoreOptionListItem {
  label: string;
  icon?: IconName;
  callback: () => void | Promise<void>;
}
