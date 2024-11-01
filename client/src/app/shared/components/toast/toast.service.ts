import { Injectable } from '@angular/core';
import { Toast } from './toast';
import { ToastStatus } from './toast-status';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toast!: Toast | null;
  private isActive: boolean = false;

  success(infoText: string) {
    this.showToast({
      status: ToastStatus.SUCCESS,
      title: 'Erfolg',
      text: infoText,
    }, 5000);
  }

  error(infoText: string) {
    this.showToast({
      status: ToastStatus.ERROR,
      title: 'Fehler',
      text: infoText,
    }, 10000);
  }

  achievement(infoText: string) {
    this.showToast({
      status: ToastStatus.ACHIEVEMENT,
      title: 'Achievement',
      text: infoText,
    }, 5000);
  }

  private showToast(toast: Toast, duration: number) {
    this.toast = toast;
    this.isActive = true;

    setTimeout(() => this.remove(), duration);
  }

  remove(): void {
    this.isActive = false;
    setTimeout(() => (this.toast = null), 500); 
  }

  get currentToast(): Toast | null {
    return this.toast;
  }

  get toastIsActive(): boolean {
    return this.isActive;
  }
}