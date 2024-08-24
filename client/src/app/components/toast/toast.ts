import { ToastStatus } from './toast-status';

export interface Toast {
  status: ToastStatus;
  title: string;
  text: string;
}
