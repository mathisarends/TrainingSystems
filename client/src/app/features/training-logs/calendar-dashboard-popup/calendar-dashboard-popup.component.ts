import { DatePipe } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';
import { DashboardCardComponent } from '../../../shared/components/dashboard-card/dashboard-card.component';
import { IconName } from '../../../shared/icon/icon-name';
import { ShareService } from '../../../shared/service/social-media-share.service';
import { TrainingDay } from '../../training-plans/training-view/training-day';

@Component({
  standalone: true,
  imports: [DashboardCardComponent],
  selector: 'app-calendar-dashboard-popup',
  templateUrl: './calendar-dashboard-popup.component.html',
  styleUrls: ['./calendar-dashboard-popup.component.scss'],
  providers: [ShareService, DatePipe],
})
export class CalendarDashboardPopupComponent {
  protected readonly IconName = IconName;

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

  constructor(
    private router: Router,
    private httpService: HttpService,
    private shareService: ShareService,
    private datePipe: DatePipe,
  ) {
    effect(() => {
      this.fetchTrainingDayInfo().subscribe((response) => console.log('response', response));
    });
  }

  protected navigateToTrainingDay(): void {
    this.router.navigate(['/training/view'], {
      queryParams: { planId: this.trainingPlanId(), week: this.weekIndex(), day: this.dayIndex() },
    });
  }

  /**
   * Shares the training log details via WhatsApp, including the date, exercises, sets, reps, and weights.
   */
  protected async shareTrainingLog(): Promise<void> {
    const trainingDay = await firstValueFrom(this.fetchTrainingDayInfo());

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
