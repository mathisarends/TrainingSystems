import { Injectable } from '@angular/core';
import { ToastType } from './toastType';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts: any[] = [];

  show(title: string, text: string, type: ToastType = ToastType.INFO) {
    const delay = 3500;
    const toast = { title, text, type };
    this.toasts.push(toast);

    setTimeout(() => this.remove(toast), delay);
  }

  remove(toast: any) {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }
}
