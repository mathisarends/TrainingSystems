import { DatePipe } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';
import { GroupedBarChartComponent } from '../../../shared/components/charts/grouped-bar-chart/grouped-bar-chart.component';
import { DashboardCardComponent } from '../../../shared/components/dashboard-card/dashboard-card.component';
import { IconBackgroundColor } from '../../../shared/components/icon-list-item/icon-background-color';
import { OnToggleView } from '../../../shared/components/modal/on-toggle-view';
import { IconName } from '../../../shared/icon/icon-name';
import { ImageDownloadService } from '../../../shared/service/image-download.service';
import { ShareService } from '../../../shared/service/social-media-share.service';
import { TrainingDay } from '../../training-plans/training-view/training-day';
import { TrainingRetrospectivePopupCardInfo } from './training-retrospective.popup-card.dto';

@Component({
  standalone: true,
  imports: [DashboardCardComponent, GroupedBarChartComponent],
  selector: 'app-calendar-dashboard-popup',
  templateUrl: './calendar-dashboard-popup.component.html',
  styleUrls: ['./calendar-dashboard-popup.component.scss'],
  providers: [ShareService, DatePipe, ImageDownloadService],
})
export class CalendarDashboardPopupComponent implements OnToggleView {
  protected readonly IconName = IconName;
  protected readonly IconBackgroundColor = IconBackgroundColor;

  mockChartData = {
    labels: ['Squat', 'Bench Press', 'Deadlift'],
    datasets: [
      {
        label: 'Week 1',
        data: [150, 100, 200],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: 'Week 2',
        data: [160, 105, 210],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Current Week',
        data: [170, 110, 220],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  /**
   * Holds the ID of the current training plan.
   */
  trainingPlanId = signal('');

  /**
   * Holds the index of the current training week (0-based).
   */
  weekIndex = signal(0);

  /**
   * Holds the index of the current training day (0-based).
   */
  dayIndex = signal(0);

  tonnage = signal(0);
  tonangeDifferenceFromlastWeek = signal(0);

  constructor(
    private router: Router,
    private httpService: HttpService,
    private shareService: ShareService,
    private datePipe: DatePipe,
  ) {
    effect(() => {
      if (this.trainingPlanId()) {
        this.httpService
          .get<TrainingRetrospectivePopupCardInfo>(
            `/training-calendar/training-day/popup-card/${this.trainingPlanId()}/${this.weekIndex()}/${this.dayIndex()}`,
          )
          .subscribe((response: TrainingRetrospectivePopupCardInfo) => {
            this.tonnage.set(response.tonnage);
            this.tonangeDifferenceFromlastWeek.set(response.tonnageDifferenceFromLastWeek);

            this.mapResponseDataToChart(response);
          });
      }
    });
  }

  onConfirm(): void {
    this.router.navigate(['/training/view'], {
      queryParams: { planId: this.trainingPlanId(), week: this.weekIndex(), day: this.dayIndex() },
    });
  }

  onToggleView(): void {
    this.fetchTrainingDayInfo().subscribe((trainingDay) => {
      this.shareTrainingLog(trainingDay);
    });
  }

  /**
   * Processes the response data for training retrospective and sets up chart data.
   * @param response - The response from the training retrospective endpoint.
   */
  private mapResponseDataToChart(response: TrainingRetrospectivePopupCardInfo): void {
    const labels = Object.keys(response.tonnageComparisonOverWeekSpan);

    const datasets = response.tonnageComparisonOverWeekSpan[labels[0]].map((_, weekIndex) => {
      return {
        label: `Week ${weekIndex + 1}`,
        data: labels.map((category) => response.tonnageComparisonOverWeekSpan[category][weekIndex] || 0),
        backgroundColor: `rgba(${54 + weekIndex * 20}, ${162 - weekIndex * 10}, ${235 - weekIndex * 15}, 0.6)`, // Adjust colors as needed
      };
    });

    this.mockChartData = {
      labels,
      datasets,
    };
  }

  /**
   * Shares the training log details via WhatsApp, including the date, exercises, sets, reps, and weights.
   */
  private shareTrainingLog(trainingDay: TrainingDay): void {
    const formattedDate = this.datePipe.transform(trainingDay.startTime, 'EEEE, dd.MM.yyyy');

    const translatedDate = this.translateDayOfWeek(formattedDate);
    const trainingDate = trainingDay.startTime ? `Heutiges Training: ${translatedDate}` : 'Heutiges Training:';

    const exercisesDetails = trainingDay.exercises
      .map((exercise) => {
        const exerciseDetails = `${exercise.exercise}: ${exercise.sets} x ${exercise.reps} ${exercise.weight}KG`;
        return exercise.actualRPE ? `${exerciseDetails}, RPE: ${exercise.actualRPE}` : exerciseDetails;
      })
      .join('\n');

    const message = `${trainingDate}\n\n${exercisesDetails}\n\n@TYR Training Systems`;

    this.shareService.shareViaWhatsApp(message);
  }

  /**
   * Translates an English weekday in the given date string to German.
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

  private fetchTrainingDayInfo(): Observable<TrainingDay> {
    return this.httpService.get(
      `/training-calendar/training-day-info/${this.trainingPlanId()}/${this.weekIndex()}/${this.dayIndex()}`,
    );
  }
}
