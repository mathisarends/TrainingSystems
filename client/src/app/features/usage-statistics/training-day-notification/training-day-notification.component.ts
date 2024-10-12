import { CommonModule, DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { Router } from '@angular/router';
import { toggleCollapseAnimation } from '../../../shared/animations/toggle-collapse';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CircularIconButtonComponent } from '../../../shared/components/circular-icon-button/circular-icon-button.component';
import { OnToggleView } from '../../../shared/components/modal/on-toggle-view';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { TooltipDirective } from '../../../shared/directives/tooltip.directive';
import { IconName } from '../../../shared/icon/icon-name';
import { IconComponent } from '../../../shared/icon/icon.component';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';
import { NotificationService } from '../../../shared/service/notification.service';
import { ShareService } from '../../../shared/service/social-media-share.service';
import { ProfileService } from '../../profile-2/service/profileService';
import { TrainingDayFinishedNotification } from '../training-finished-notification';

@Component({
  selector: 'app-training-day-notification',
  standalone: true,
  imports: [
    CommonModule,
    IconComponent,
    FormatDatePipe,
    ButtonComponent,
    CircularIconButtonComponent,
    IconComponent,
    TooltipDirective,
  ],
  templateUrl: './training-day-notification.component.html',
  styleUrls: ['./training-day-notification.component.scss'],
  providers: [ShareService, DatePipe],
  animations: [toggleCollapseAnimation],
})
export class TrainingDayNotificationComponent implements OnToggleView {
  protected IconName = IconName;

  notification = input.required<TrainingDayFinishedNotification>();

  constructor(
    private notificationService: NotificationService,
    private shareService: ShareService,
    private datePipe: DatePipe,
    private toastService: ToastService,
    private router: Router,
    protected profileService: ProfileService,
  ) {}

  onToggleView(): void {
    this.shareTrainingLog();
  }

  onConfirm(): void {
    this.notificationService.getTrainingDayById(this.notification().id).subscribe((response) => {
      const { trainingPlanId, weekIndex, dayIndex } = response;

      this.router.navigate(['/training/view'], {
        queryParams: { planId: trainingPlanId, week: weekIndex, day: dayIndex },
      });
    });
  }

  protected deleteNotification(): void {
    this.notificationService.deleteTrainingDayNotification(this.notification().id).subscribe(() => {
      this.toastService.success('Benachrichtigung gelöscht');
    });
  }

  protected shareTrainingLog() {
    const formattedDate = this.datePipe.transform(this.notification().startTime, 'EEEE, dd.MM.yyyy');

    const trainingDate = this.notification().startTime ? `Heutiges Training: ${formattedDate}` : 'Heutiges Training:';

    // Map through the exercises and format the details
    const exercisesDetails = this.notification()
      .exercises.map((exercise) => {
        const exerciseDetails = `${exercise.exercise}: ${exercise.sets} x ${exercise.reps} ${exercise.weight}KG`;
        return exercise.actualRPE ? `${exerciseDetails}, RPE: ${exercise.actualRPE}` : exerciseDetails;
      })
      .join('\n');

    const message = `${trainingDate}\n\n${exercisesDetails}`;

    this.shareService.shareViaWhatsApp(message);
  }
}
