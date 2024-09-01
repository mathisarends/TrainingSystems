import { Component } from '@angular/core';
import { ToastService } from './toast.service';
import { ToastStatus } from './toast-status';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../shared/icon/icon.component';
import { IconName } from '../../shared/icon/icon-name';

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

  remove() {
    this.toastService.remove();
  }
}
