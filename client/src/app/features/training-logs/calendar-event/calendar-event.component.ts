import { Component, computed, HostListener, input } from '@angular/core';
import { Router } from '@angular/router';
import { ModalOptionsBuilder } from '../../../core/services/modal/modal-options-builder';
import { ModalService } from '../../../core/services/modal/modal.service';
import { ModalSize } from '../../../core/services/modal/modalSize';
import { IconName } from '../../../shared/icon/icon-name';
import { IconComponent } from '../../../shared/icon/icon.component';
import { NotificationService } from '../../../shared/service/notification/notification.service';
import { TrainingDayCalendarEntry } from '../training-log-calendar/dto/training-day-calendar-entry';
import { TrainingLogPopupComponent } from '../training-log-popup/training-log-popup.component';
import { TrainingPreviewPopupComponent } from '../training-preview-popup/training-preview-popup.component';
import { CalendarEvent } from './calendare-event.enum';

@Component({
  selector: 'app-calendar-event',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './calendar-event.component.html',
  styleUrls: ['./calendar-event.component.scss'],
})
export class CalendarEventComponent {
  protected readonly IconName = IconName;
  protected readonly CalendarEvent = CalendarEvent;

  /**
   * The calendar entry representing a specific training day.
   */
  trainingDayCalendarEntry = input.required<TrainingDayCalendarEntry>();

  eventType = input(CalendarEvent.PROSPECTIVE);

  /**
   * Computed property to extract the zero-based week index from the training day label.
   * Example: "W2" in the label will return `1`.
   */
  weekIndex = computed(() => this.parseWeekIndexFormLabel(this.trainingDayCalendarEntry().label));

  /**
   * Computed property to extract the zero-based day index from the training day label.
   * Example: "D3" in the label will return `2`.
   */
  dayIndex = computed(() => this.parseDayIndexFromLabel(this.trainingDayCalendarEntry().label));

  constructor(
    private modalService: ModalService,
    private notificationService: NotificationService,
    private router: Router,
  ) {}

  @HostListener('click')
  onHostClick() {
    if (this.isTrainingLog()) {
      this.clearNotificationsIfNecessary();
      this.openTrainingLog();
      return;
    }

    this.openTrainingPreview();
  }

  private clearNotificationsIfNecessary(): void {
    if (this.eventType() !== CalendarEvent.NOTIFICATION) {
      return;
    }
    this.notificationService.deleteTrainingDayNotification().subscribe();
  }

  private openTrainingLog(): void {
    const modalTitle = this.getModalTitle();

    const modalOptions = new ModalOptionsBuilder()
      .setComponent(TrainingLogPopupComponent)
      .setSize(ModalSize.LARGE)
      .setButtonText('Zum Trainingstag')
      .setTitle(modalTitle)
      .setAlternativeButtonText('Teilen')
      .setComponentData({
        trainingPlanId: this.trainingDayCalendarEntry().planId,
        weekIndex: this.weekIndex(),
        dayIndex: this.dayIndex(),
      })
      .setOnSubmitCallback(async () => this.navigateToTrainingDay())
      .build();

    this.modalService.open(modalOptions);
  }

  private openTrainingPreview(): void {
    const modalTitle = this.getModalTitle();

    const modalOptions = new ModalOptionsBuilder()
      .setComponent(TrainingPreviewPopupComponent)
      .setSize(ModalSize.MEDIUM)
      .setTitle(modalTitle)
      .setButtonText('Zum Trainingstag')
      .setComponentData({
        trainingPlanId: this.trainingDayCalendarEntry().planId,
        weekIndex: this.weekIndex(),
        dayIndex: this.dayIndex(),
      })
      .setOnSubmitCallback(async () => this.navigateToTrainingDay())
      .build();

    this.modalService.open(modalOptions);
  }

  private navigateToTrainingDay(): void {
    this.router.navigate(['/training/view'], {
      queryParams: { planId: this.trainingDayCalendarEntry().planId, week: this.weekIndex(), day: this.dayIndex() },
    });
  }

  private getModalTitle(): string {
    return `${this.trainingDayCalendarEntry().label} ${this.trainingDayCalendarEntry().planTitle.toUpperCase()}`;
  }

  /**
   * Parses the week index (zero-based) from the label of the training day.
   * Example: "W2 D3" -> `1`
   */
  private parseWeekIndexFormLabel(label: string): number {
    const weekRegex = /W(\d+)/;
    const match = weekRegex.exec(label);
    return match ? Number(match[1]) - 1 : -1;
  }

  /**
   * Parses the day index (zero-based) from the label of the training day.
   * Example: "W2 D3" -> `2`

   */
  private parseDayIndexFromLabel(label: string): number {
    const dayRegex = /D(\d+)/;
    const match = dayRegex.exec(label);
    return match ? Number(match[1]) - 1 : -1;
  }

  private isTrainingLog(): boolean {
    return this.eventType() === CalendarEvent.LOG || this.eventType() === CalendarEvent.NOTIFICATION;
  }
}
