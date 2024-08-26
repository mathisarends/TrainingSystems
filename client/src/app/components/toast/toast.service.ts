import { Injectable } from '@angular/core';
import { Toast } from './toast';
import { ToastStatus } from './toast-status';
import { stat } from 'fs';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts: Toast[] = [];

  show(title: string, text: string, status = ToastStatus.ERROR) {
    const toast = { title, text, status };

    toast.title = status === ToastStatus.SUCESS ? 'Erfolg' : 'Fehler';

    this.toasts.push(toast);

    setTimeout(() => this.remove(toast), status === ToastStatus.SUCESS ? 5000 : 10000);
  }

  remove(toast: any) {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }
}
