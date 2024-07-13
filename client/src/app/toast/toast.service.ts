import { Injectable } from '@angular/core';
import { ToastType } from './toastType';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts: any[] = [];

  show(
    title: string,
    text: string,
    type: ToastType = ToastType.INFO,
    options: any = {}
  ) {
    const toast = { title, text, type, ...options };
    this.toasts.push(toast);

    if (options.delay) {
      setTimeout(() => this.remove(toast), options.delay);
    }
  }

  remove(toast: any) {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }
}
