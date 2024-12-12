import { IconName } from '../../../icon/icon-name';

export interface BottomSheetItem {
  icon: IconName;
  title: string;
  subtitle: string;
  onSubmitCallback?: () => void | Promise<void>;
}
