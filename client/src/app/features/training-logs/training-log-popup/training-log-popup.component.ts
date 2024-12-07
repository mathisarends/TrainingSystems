import { DatePipe } from '@angular/common';
import { Component, computed, effect, signal, WritableSignal } from '@angular/core';
import { ChartDataDto } from '@shared/charts/chart-data.dto';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';
import { ChartData } from '../../../shared/components/charts/chart-data';
import { BarChartDataset } from '../../../shared/components/charts/grouped-bar-chart/bar-chart.-data-set';
import { GroupedBarChartComponent } from '../../../shared/components/charts/grouped-bar-chart/grouped-bar-chart.component';
import { DashboardCardComponent } from '../../../shared/components/dashboard-card/dashboard-card.component';
import { IconBackgroundColor } from '../../../shared/components/icon-list-item/icon-background-color';
import { ChartSkeletonComponent } from '../../../shared/components/loader/chart-skeleton/chart-skeleton.component';
import { OnToggleView } from '../../../shared/components/modal/on-toggle-view';
import { IconName } from '../../../shared/icon/icon-name';
import { ImageDownloadService } from '../../../shared/service/image-download.service';
import { ShareService } from '../../../shared/service/social-media-share.service';
import { TrainingDay } from '../../training-plans/training-view/training-day';
import { TrainingRetrospectivePopupCardInfo } from './training-retrospective.popup-card.dto';

@Component({
  standalone: true,
  imports: [DashboardCardComponent, GroupedBarChartComponent, ChartSkeletonComponent],
  selector: 'app-calendar-dashboard-popup',
  templateUrl: './training-log-popup.component.html',
  styleUrls: ['./training-log-popup.component.scss'],
  providers: [ShareService, DatePipe, ImageDownloadService],
})
export class TrainingLogPopupComponent implements OnToggleView {
  protected readonly IconName = IconName;
  protected readonly IconBackgroundColor = IconBackgroundColor;

  loadingComplete = computed(() => this.volumeComparisonChartData());

  /**
   * Holds the proceessed chart data for volume comparison over weeks.
   */
  volumeComparisonChartData: WritableSignal<ChartData<BarChartDataset> | undefined> = signal(undefined);

  /**
   * Signal storing the ID of the current training plan. Passed from the calendar-event.component.
   */
  trainingPlanId = signal('');

  /**
   * Signal holding the current training week index (0-based). Passed from the calendar-event.component.
   */
  weekIndex = signal(0);

  /**
   * Signal holding the current training day index (0-based). Passed from the calendar-event.component.
   */
  dayIndex = signal(0);

  /**
   * Holds the total tonnage for the current training day.
   */
  tonnage = signal(0);

  /**
   * Holds the difference in tonnage compared to the previous week.
   */
  tonangeDifferenceFromlastWeek = signal(0);

  /**
   * Holds the duration of the current training session in minutes.
   */
  duration = signal(0);

  /**
   * Holds the duration difference compared to the previous week.
   */
  durationDifferenceFromLastWeek = signal(0);

  constructor(
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

            this.duration.set(response.durationInMinutes);
            this.durationDifferenceFromLastWeek.set(response.durationDifferenceFromLastWeek);

            this.mapResponseDataToChart(response.tonnageComparisonOverWeekSpan);
          });
      }
    });
  }

  onToggleView(): void {
    this.fetchTrainingDayInfo().subscribe((trainingDay) => {
      this.shareTrainingLog(trainingDay);
    });
  }

  /**
   * Processes the response data for training retrospective and sets up chart data.
   */
  private mapResponseDataToChart(chartDataDto: ChartDataDto): void {
    const labels = Object.keys(chartDataDto);

    const datasets: BarChartDataset[] = chartDataDto[labels[0]].map((_, weekIndex) => {
      return {
        label: `Week ${weekIndex + 1}`,
        data: labels.map((category) => chartDataDto[category][weekIndex] || 0),
        backgroundColor: `rgba(${54 + weekIndex * 30}, ${162 - weekIndex * 20}, ${235 - weekIndex * 15}, 0.6)`,
      };
    });

    const chartData: ChartData<BarChartDataset> = {
      labels: labels,
      datasets: datasets,
    };

    this.volumeComparisonChartData.set(chartData);
  }

  /**
   * Shares the training log details via WhatsApp, including the date, exercises, sets, reps, and weights.
   * @param trainingDay - The training day data to be shared.
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

  /**
   * Fetches the training day information for the current plan, week, and day.
   */
  private fetchTrainingDayInfo(): Observable<TrainingDay> {
    return this.httpService.get(
      `/training-calendar/training-day-info/${this.trainingPlanId()}/${this.weekIndex()}/${this.dayIndex()}`,
    );
  }
}
