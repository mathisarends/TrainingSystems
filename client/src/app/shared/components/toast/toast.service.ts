import { Injectable } from '@angular/core';
import { Toast } from './toast';
import { ToastStatus } from './toast-status';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toast!: Toast | null;

  success(infoText: string) {
    this.toast = {
      status: ToastStatus.SUCCESS,
      title: 'Erfolg',
      text: infoText,
    };

    setTimeout(() => this.remove(), 20000);
  }

  error(infoText: string) {
    this.toast = {
      status: ToastStatus.ERROR,
      title: 'Fehler',
      text: infoText,
    };

    setTimeout(() => this.remove(), 10000);
  }

  achievement(infoText: string) {
    this.toast = {
      status: ToastStatus.ACHIEVEMENT,
      title: 'Achievement',
      text: infoText,
    };

    setTimeout(() => this.remove(), 7500);
  }

  /**
   * Removes the current toast.
   * Sets the toast property to null, indicating no active toast.
   */
  remove(): void {
    this.toast = null;
  }

  /**
   * Gets the current toast.
   *
   * @returns The current toast or null if no toast is active.
   */
  get currentToast(): Toast | null {
    return this.toast;
  }
}
