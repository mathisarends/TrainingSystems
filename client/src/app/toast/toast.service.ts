import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts: any[] = [];

  show(title: string, text: string, options: any = {}) {
    const toast = { title, text, ...options };
    this.toasts.push(toast);

    if (options.delay) {
      setTimeout(() => this.remove(toast), options.delay);
    }
  }

  remove(toast: any) {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }
}
