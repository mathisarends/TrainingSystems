import { Component, HostListener, input } from '@angular/core';
import { ModalService } from '../../../core/services/modal/modalService';
import { IconName } from '../../../shared/icon/icon-name';
import { CalendarDashboardPopupComponent } from '../calendar-dashboard-popup/calendar-dashboard-popup.component';
import { TrainingDayCalendarEntry } from '../training-log-calendar/dto/training-day-calendar-entry';

@Component({
  selector: 'app-calendar-event',
  standalone: true,
  template: `{{ trainingDayCalendarEntry().label }}`,
  styleUrls: ['./calendar-event.component.scss'],
})
export class CalendarEventComponent {
  protected readonly IconBackgroundColor = IconName;
  trainingDayCalendarEntry = input.required<TrainingDayCalendarEntry>();

  constructor(private modalService: ModalService) {}

  @HostListener('click')
  onHostClick() {
    const weekIndex = this.parseWeekIndexFormLabel(this.trainingDayCalendarEntry().label);
    const dayIndex = this.parseDayIndexFromLabel(this.trainingDayCalendarEntry().label);

    this.modalService.open({
      title: `${this.trainingDayCalendarEntry().label} ${this.trainingDayCalendarEntry().planTitle.toUpperCase()}`,
      component: CalendarDashboardPopupComponent,
      componentData: {
        trainingPlanId: this.trainingDayCalendarEntry().planId,
        weekIndex,
        dayIndex,
      },
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
