import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IconName } from '../../icon/icon-name';
import { IconComponent } from '../../icon/icon.component';
import { ToastStatus } from './toast-status';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent {
  protected IconName = IconName;

  protected readonly ToastStatus = ToastStatus;

  constructor(public toastService: ToastService) {}

  protected close() {
    this.toastService.remove();
  }
}
