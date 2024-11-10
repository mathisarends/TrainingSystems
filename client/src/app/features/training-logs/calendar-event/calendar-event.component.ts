import { Component, HostListener, input } from '@angular/core';
import { Router } from '@angular/router';
import { ModalService } from '../../../core/services/modal/modalService';
import { ModalSize } from '../../../core/services/modal/modalSize';
import { IconName } from '../../../shared/icon/icon-name';
import { IconComponent } from '../../../shared/icon/icon.component';
import { TrainingDayCalendarEntry } from '../training-log-calendar/dto/training-day-calendar-entry';
import { TrainingLogPopupComponent } from '../training-log-popup/training-log-popup.component';
import { TrainingPreviewPopupComponent } from '../training-preview-popup/training-preview-popup.component';

@Component({
  selector: 'app-calendar-event',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './calendar-event.component.html',
  styleUrls: ['./calendar-event.component.scss'],
})
export class CalendarEventComponent {
  protected readonly IconName = IconName;

  /**
   * The calendar entry representing a specific training day.
   */
  trainingDayCalendarEntry = input.required<TrainingDayCalendarEntry>();

  /**
   * Indicates wether its an prospective or retrospective view to the training day.
   */
  isTrainingLog = input.required<boolean>();

  constructor(
    private router: Router,
    private modalService: ModalService,
  ) {}

  @HostListener('click')
  onHostClick() {
    const weekIndex = this.parseWeekIndexFormLabel(this.trainingDayCalendarEntry().label);
    const dayIndex = this.parseDayIndexFromLabel(this.trainingDayCalendarEntry().label);

    if (this.isTrainingLog()) {
      this.modalService.open({
        title: this.getModalTitle(),
        component: TrainingLogPopupComponent,
        size: ModalSize.LARGE,
        buttonText: 'Zum Trainingstag',
        secondaryButtonText: 'Teilen',
        componentData: {
          trainingPlanId: this.trainingDayCalendarEntry().planId,
          weekIndex,
          dayIndex,
        },
      });
    } else {
      this.modalService.open({
        component: TrainingPreviewPopupComponent,
        title: this.getModalTitle(),
        buttonText: 'Zum Trainingstag',
        componentData: {
          trainingPlanId: this.trainingDayCalendarEntry().planId,
          weekIndex,
          dayIndex,
        },
      });
    }
  }

  private getModalTitle(): string {
    return `${this.trainingDayCalendarEntry().label} ${this.trainingDayCalendarEntry().planTitle.toUpperCase()}`;
  }

  private navigateToTrainingDay(weekIndex: number, dayIndex: number): void {
    this.router.navigate(['/training/view'], {
      queryParams: { planId: this.trainingDayCalendarEntry().planId, week: weekIndex, day: dayIndex },
    });
  }

  private parseWeekIndexFormLabel(label: string): number {
    const weekRegex = /W(\d+)/;
    const match = weekRegex.exec(label);
    return match ? Number(match[1]) - 1 : -1;
  }

  private parseDayIndexFromLabel(label: string): number {
    const dayRegex = /D(\d+)/;
    const match = dayRegex.exec(label);
    return match ? Number(match[1]) - 1 : -1;
  }
}
