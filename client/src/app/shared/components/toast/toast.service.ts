import { Injectable } from '@angular/core';
import { Toast } from './toast';
import { ToastStatus } from './toast-status';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toast!: Toast | null;

  success(infoText: string) {
    const toast: Toast = {
      status: ToastStatus.SUCCESS,
      title: 'Erfolg',
      text: infoText,
    };

    this.toast = toast;

    setTimeout(() => this.remove(), 5000);
  }

  error(infoText: string) {
    const toast: Toast = {
      status: ToastStatus.ERROR,
      title: 'Fehler',
      text: infoText,
    };

    this.toast = toast;

    setTimeout(() => this.remove(), 10000);
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
