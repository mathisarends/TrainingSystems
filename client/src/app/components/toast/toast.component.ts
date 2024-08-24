import { Component } from '@angular/core';
import { ToastService } from './toast.service';
import { ToastStatus } from './toast-status';
import { CommonModule } from '@angular/common';
import { WarningIconComponent } from '../icon/warning-icon/warning-icon.component';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, WarningIconComponent],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent {
  protected readonly ToastStatus = ToastStatus;

  constructor(public toastService: ToastService) {}

  remove(toast: any) {
    this.toastService.remove(toast);
  }
}
