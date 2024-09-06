import { Injectable } from '@angular/core';
import { Toast } from './toast';
import { ToastStatus } from './toast-status';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toast!: Toast | null;

  show(title: string, text: string, status = ToastStatus.SUCESS) {
    const toast = { title, text, status };

    toast.title = status === ToastStatus.SUCESS ? 'Erfolg' : 'Fehler';

    this.toast = toast;

    setTimeout(() => this.remove(), status === ToastStatus.SUCESS ? 5000 : 10000);
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
