import { CommonModule, DatePipe } from '@angular/common';
import { Component, input, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toggleCollapseAnimation } from '../../../shared/animations/toggle-collapse';
import { CircularIconButtonComponent } from '../../../shared/components/circular-icon-button/circular-icon-button.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { TooltipDirective } from '../../../shared/directives/tooltip.directive';
import { IconName } from '../../../shared/icon/icon-name';
import { IconComponent } from '../../../shared/icon/icon.component';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';
import { NotificationService } from '../../../shared/service/notification.service';
import { ShareService } from '../../../shared/service/social-media-share.service';
import { TrainingDayFinishedNotification } from '../training-finished-notification';

@Component({
  selector: 'app-training-day-notification',
  standalone: true,
  imports: [CommonModule, IconComponent, FormatDatePipe, CircularIconButtonComponent, TooltipDirective],
  templateUrl: './training-day-notification.component.html',
  styleUrls: ['./training-day-notification.component.scss'],
  providers: [ShareService, DatePipe],
  animations: [toggleCollapseAnimation],
})
export class TrainingDayNotificationComponent implements OnInit {
  protected IconName = IconName;

  notificationsInput = input.required<TrainingDayFinishedNotification[]>();
  notifications = signal<TrainingDayFinishedNotification[]>([]);

  constructor(
    private notificationService: NotificationService,
    private shareService: ShareService,
    private datePipe: DatePipe,
    private toastService: ToastService,
    private router: Router,
  ) {}

  ngOnInit(): void {
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

      this.toastService.success('Benachrichtigung gelöscht');
    });
  }

  protected goToTrainingPlan(notificationId: string): void {
    this.notificationService.getTrainingDayById(notificationId).subscribe((response) => {
      const { trainingPlanId, weekIndex, dayIndex } = response;

      this.router.navigate(['/training/view'], {
        queryParams: { planId: trainingPlanId, week: weekIndex, day: dayIndex },
      });
    });
  }

  protected shareTrainingLog(notification: TrainingDayFinishedNotification) {
    const formattedDate = this.datePipe.transform(notification.startTime, 'EEEE, dd.MM.yyyy');

    const trainingDate = notification.startTime ? `Heutiges Training: ${formattedDate}` : 'Heutiges Training:';

    // Map through the exercises and format the details
    const exercisesDetails = notification.exercises
      .map((exercise) => {
        const exerciseDetails = `${exercise.exercise}: ${exercise.sets} x ${exercise.reps} ${exercise.weight}KG`;
        return exercise.actualRPE ? `${exerciseDetails}, RPE: ${exercise.actualRPE}` : exerciseDetails;
      })
      .join('\n');

    const message = `${trainingDate}\n\n${exercisesDetails}`;

    this.shareService.shareViaWhatsApp(message);
  }
}
