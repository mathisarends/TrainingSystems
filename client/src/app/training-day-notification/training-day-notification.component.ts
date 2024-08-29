import { Component, input } from '@angular/core';
import { TrainingDayFinishedNotification } from '../usage-statistics/training-finished-notification';
import { CommonModule } from '@angular/common';
import { CloseIconComponent } from '../components/icon/close-icon/close-icon.component';

@Component({
  selector: 'app-training-day-notification',
  standalone: true,
  imports: [CommonModule, CloseIconComponent],
  templateUrl: './training-day-notification.component.html',
  styleUrl: './training-day-notification.component.scss',
})
export class TrainingDayNotificationComponent {
  notifications = input.required<TrainingDayFinishedNotification[]>();
}
