import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts: any[] = [];

  show(title: string, text: string) {
    const delay = 5000;
    const toast = { title, text };
    this.toasts.push(toast);

    setTimeout(() => this.remove(toast), delay);
  }

  remove(toast: any) {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }
}
