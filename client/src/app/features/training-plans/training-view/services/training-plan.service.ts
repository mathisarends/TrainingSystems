import { Injectable, signal } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, Subject, tap } from 'rxjs';
import { HttpService } from '../../../../core/services/http-client.service';
import { TrainingSessionCardViewDto } from '../../../training-session/model/training-session-card-view-dto';
import { TrainingPlanCardView } from '../models/exercise/training-plan-card-view-dto';

@Injectable({
  providedIn: 'root',
})
export class TrainingPlanService {
  private trainingPlansChangedSubject = new Subject<void>();

  trainingPlansChanged$ = this.trainingPlansChangedSubject.asObservable();

  trainingPlans = signal<TrainingPlanCardView[]>([]);

  constructor(private httpService: HttpService) {}

  /**
   * Emits a notification when the training plans have changed.
   * Can be used by components to react to updates in the training plans.
   */
  trainingPlanChanged(): void {
    this.trainingPlansChangedSubject.next();
  }

  getFirstAvailableDateForTrainingPlan(): Observable<string> {
    return this.httpService.get('/training/first-available-date');
  }

  /**
   * Fetches the training plans and session card views from the backend
   * and updates the trainingPlans signal.
   * Combines both results into one array for further use.
   * If fetching training sessions fails, it returns an empty array for sessions,
   * preserving the expected data type.
   * @returns An Observable of the combined result array.
   */
  loadAndCacheTrainingPlans(): Observable<(TrainingPlanCardView | TrainingSessionCardViewDto)[]> {
    const trainingPlans$: Observable<TrainingPlanCardView[]> = this.httpService.get('/training');
    const trainingSessions$: Observable<TrainingSessionCardViewDto[]> = this.httpService.get('/training-routine');
    catchError(() => of<TrainingSessionCardViewDto[]>([]));

    return forkJoin([trainingPlans$, trainingSessions$]).pipe(
      map(([trainingPlans, trainingSessions]) => [...trainingPlans, ...trainingSessions]),
      tap((combinedResults) => this.trainingPlans.set(combinedResults)),
    );
  }
}
