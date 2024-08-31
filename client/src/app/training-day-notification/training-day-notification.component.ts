import { Component, input, OnInit, signal } from '@angular/core';
import { TrainingDayFinishedNotification } from '../usage-statistics/training-finished-notification';
import { CommonModule } from '@angular/common';
import { CloseIconComponent } from '../components/icon/close-icon/close-icon.component';
import { NotificationService } from '../notification-page/notification.service';
import { ToastService } from '../components/toast/toast.service';
import { ToastStatus } from '../components/toast/toast-status';
import { Router } from '@angular/router';
import { ChevronDownIconComponent } from '../components/icon/chevron-down-icon/chevron-down-icon.component';
import { ChevronUpIconComponent } from '../components/icon/chevron-up-icon/chevron-up-icon.component';
import { toggleCollapseAnimation } from '../shared/animations';
import { FormatDatePipe } from '../shared/pipes/format-date.pipe';

@Component({
  selector: 'app-training-day-notification',
  standalone: true,
  imports: [CommonModule, CloseIconComponent, ChevronDownIconComponent, ChevronUpIconComponent, FormatDatePipe],
  templateUrl: './training-day-notification.component.html',
  styleUrls: ['./training-day-notification.component.scss'],
  animations: [toggleCollapseAnimation],
})
export class TrainingDayNotificationComponent implements OnInit {
  notificationsInput = input.required<TrainingDayFinishedNotification[]>();
  notifications = signal<TrainingDayFinishedNotification[]>([]);

  constructor(
    private notificationService: NotificationService,
    private toastService: ToastService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Initialize the writable signal with the input value
    this.notifications.set(
      this.notificationsInput().map((notification) => ({ ...notification, exerciseTabCollapsed: true })),
    );
  }

  protected toggleExerciseTab(notification: TrainingDayFinishedNotification) {
    notification.exerciseTabCollapsed = !notification.exerciseTabCollapsed;
  }

  protected deleteNotification(notificationId: string): void {
    this.notificationService.deleteTrainingDayNotification(notificationId).subscribe((response) => {
      this.notifications.set(this.notifications().filter((notification) => notification.id !== notificationId));

      this.toastService.show('Erfolg', 'Benachrichtigung gelöscht', ToastStatus.SUCESS);
    });
  }

  protected goToTrainingPlan(notificationId: string): void {
    this.notificationService.getTrainingDayById(notificationId).subscribe((response) => {
      // Assuming the response contains the trainingPlanId, weekIndex, and dayIndex
      const { trainingPlanId, weekIndex, dayIndex } = response;

      // Navigate to the route with query parameters
      this.router.navigate(['/training/view'], {
        queryParams: { planId: trainingPlanId, week: weekIndex, day: dayIndex },
      });
    });
  }
}