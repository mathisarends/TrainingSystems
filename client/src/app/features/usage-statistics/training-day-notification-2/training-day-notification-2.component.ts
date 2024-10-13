import { DatePipe } from '@angular/common';
import { Component, input, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { ModalService } from '../../../core/services/modal/modalService';
import { MoreOptionListItem } from '../../../shared/components/more-options-button/more-option-list-item';
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

  notification = input.required<TrainingDayFinishedNotification>();

  isMoreOptionsCollapsed = signal(true);

  moreOptions: WritableSignal<MoreOptionListItem[]> = signal([
    { label: 'Ansehen', icon: IconName.EYE, callback: () => this.navigateToTrainingDay() },
    {
      label: 'Teilen',
      icon: IconName.SHARE,
      callback: () => this.shareTrainingLog(),
    },
  ]);

  constructor(
    private modalService: ModalService,
    private notificationService: NotificationService,
    private datePipe: DatePipe,
    private router: Router,
    private shareService: ShareService,
  ) {}

  protected toggleMoreOptionsCollapseState() {
    this.isMoreOptionsCollapsed.set(!this.isMoreOptionsCollapsed());
  }

  private navigateToTrainingDay(): void {
    this.notificationService.getTrainingDayById(this.notification().id).subscribe((response) => {
      const { trainingPlanId, weekIndex, dayIndex } = response;

      this.router.navigate(['/training/view'], {
        queryParams: { planId: trainingPlanId, week: weekIndex, day: dayIndex },
      });
    });
  }

  protected shareTrainingLog(): void {
    const formattedDate = this.datePipe.transform(this.notification().startTime, 'EEEE, dd.MM.yyyy');

    const trainingDate = this.notification().startTime ? `Heutiges Training: ${formattedDate}` : 'Heutiges Training:';

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
