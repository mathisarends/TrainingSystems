import { AsyncPipe } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';
import { ChartSkeletonComponent } from '../../../shared/components/loader/chart-skeleton/chart-skeleton.component';
import { OnConfirm } from '../../../shared/components/modal/on-confirm';
import { TrainingDay } from '../../training-plans/training-view/training-day';

@Component({
  selector: 'app-training-preview-popup',
  standalone: true,
  imports: [ChartSkeletonComponent, AsyncPipe],
  templateUrl: './training-preview-popup.component.html',
  styleUrls: ['./training-preview-popup.component.scss'],
})
export class TrainingPreviewPopupComponent implements OnConfirm {
  /**
   * ID of the training plan to preview.
   */
  trainingPlanId = signal<string>('');

  /**
   * Index of the week in the training plan.
   */
  weekIndex = signal<number>(0);

  /**
   * Index of the day in the training plan.
   */
  dayIndex = signal<number>(0);

  trainingDay$: Observable<TrainingDay> | undefined = undefined;

  constructor(
    private httpService: HttpService,
    private router: Router,
  ) {
    effect(() => {
      if (this.trainingPlanId()) {
        this.trainingDay$ = this.fetchTrainingDayInfo();
      }
    });
  }

  onConfirm(): void {
    this.router.navigate(['/training/view'], {
      queryParams: { planId: this.trainingPlanId(), week: this.weekIndex(), day: this.dayIndex() },
    });
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
