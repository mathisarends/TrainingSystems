import { Component, HostListener, input } from '@angular/core';
import { Router } from '@angular/router';
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
        title: `${this.trainingDayCalendarEntry().label} ${this.trainingDayCalendarEntry().planTitle.toUpperCase()}`,
        component: CalendarDashboardPopupComponent,
        hasFooter: false,
        componentData: {
          trainingPlanId: this.trainingDayCalendarEntry().planId,
          weekIndex,
          dayIndex,
        },
      });
    } else {
      this.navigateToTrainingDay(weekIndex, dayIndex);
    }
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
