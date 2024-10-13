import { DatePipe } from '@angular/common';
import { Component, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MoreOptionsList } from '../../../shared/components/more-options-list/more-options-list.component';
import { IconName } from '../../../shared/icon/icon-name';
import { IconComponent } from '../../../shared/icon/icon.component';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';
import { NotificationService } from '../../../shared/service/notification.service';
import { ShareService } from '../../../shared/service/social-media-share.service';
import { TrainingDayFinishedNotification } from '../training-finished-notification';

@Component({
  selector: 'app-training-day-notification-2',
  templateUrl: './training-day-notification-2.component.html',
  styleUrls: ['./training-day-notification-2.component.scss'],
  standalone: true,
  providers: [DatePipe, ShareService],
  imports: [FormatDatePipe, IconComponent, MoreOptionsList],
})
export class TrainingDayNotification2Component {
  protected readonly IconName = IconName;

  /**
   * Notification input containing details of the finished training day.
   */
  notification = input.required<TrainingDayFinishedNotification>();

  /**
   * Signal controlling the collapsed state of the "More Options" list.
   */
  isMoreOptionsCollapsed = signal(true);

  /**
   * List of more options to display in the dropdown, including 'view' and 'share'.
   */
  moreOptions = [
    { label: 'Ansehen', icon: IconName.EYE, callback: () => this.navigateToTrainingDay() },
    {
      label: 'Teilen',
      icon: IconName.SHARE,
      callback: () => this.shareTrainingLog(),
    },
  ];

  constructor(
    private notificationService: NotificationService,
    private datePipe: DatePipe,
    private router: Router,
    private shareService: ShareService,
  ) {}

  /**
   * Toggles the collapse state of the "More Options" list.
   */
  protected toggleMoreOptionsCollapseState() {
    this.isMoreOptionsCollapsed.set(!this.isMoreOptionsCollapsed());
  }

  /**
   * Navigates to the detailed view of the training day, retrieving the necessary details by notification ID.
   */
  private navigateToTrainingDay(): void {
    this.notificationService.getTrainingDayById(this.notification().id).subscribe((response) => {
      const { trainingPlanId, weekIndex, dayIndex } = response;

      this.router.navigate(['/training/view'], {
        queryParams: { planId: trainingPlanId, week: weekIndex, day: dayIndex },
      });
    });
  }

  /**
   * Shares the training log details via WhatsApp, including the date, exercises, sets, reps, and weights.
   */
  protected shareTrainingLog(): void {
    const formattedDate = this.datePipe.transform(this.notification().startTime, 'EEEE, dd.MM.yyyy');

    const translatedDate = this.translateDayOfWeek(formattedDate);
    const trainingDate = this.notification().startTime ? `Heutiges Training: ${translatedDate}` : 'Heutiges Training:';

    const exercisesDetails = this.notification()
      .exercises.map((exercise) => {
        const exerciseDetails = `${exercise.exercise}: ${exercise.sets} x ${exercise.reps} ${exercise.weight}KG`;
        return exercise.actualRPE ? `${exerciseDetails}, RPE: ${exercise.actualRPE}` : exerciseDetails;
      })
      .join('\n');

    const message = `${trainingDate}\n\n${exercisesDetails}\n\n@TYR Training Systems`;

    this.shareService.shareViaWhatsApp(message);
  }

  /**
   * Translates an English weekday in the given date string to German.
   * @param dateString Date string containing an English weekday.
   * @returns Translated date string with the German weekday.
   */
  private translateDayOfWeek(dateString: string | null): string {
    if (!dateString) return '';

    const dayTranslations: { [key: string]: string } = {
      Monday: 'Montag',
      Tuesday: 'Dienstag',
      Wednesday: 'Mittwoch',
      Thursday: 'Donnerstag',
      Friday: 'Freitag',
      Saturday: 'Samstag',
      Sunday: 'Sonntag',
    };

    return dateString.replace(
      /Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/g,
      (match) => dayTranslations[match],
    );
  }
}
