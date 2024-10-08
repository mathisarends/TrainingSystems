import { Injectable, signal } from '@angular/core';
import { forkJoin, map, Observable, Subject, tap } from 'rxjs';
import { HttpService } from '../../../../core/services/http-client.service';
import { BasicConfirmationResponse } from '../../../../shared/dto/basic-confirmation-response';
import { TrainingSessionCardViewDto } from '../../../training-session/model/training-session-card-view-dto';
import { TrainingPlanCardView } from '../models/exercise/training-plan-card-view-dto';

@Injectable({
  providedIn: 'root',
})
export class TrainingPlanService {
  private trainingPlansChangedSubject = new Subject<void>();

  trainingPlansChanged$ = this.trainingPlansChangedSubject.asObservable();

  private trainingPlans = signal<TrainingPlanCardView[]>([]);

  constructor(private httpService: HttpService) {}

  /**
   * Emits a notification when the training plans have changed.
   * Can be used by components to react to updates in the training plans.
   */
  trainingPlanChanged(): void {
    this.trainingPlansChangedSubject.next();
  }

  /**
   * Reorders the training plans by sending the new order to the backend.
   * @param trainingPlanIds The new order of training plan IDs.
   * @returns An Observable of the server confirmation response.
   */
  reorderTrainingPlans(trainingPlanIds: string[]): Observable<BasicConfirmationResponse> {
    return this.httpService.post('/training/reorder', { updatedOrder: trainingPlanIds });
  }

  /**
   * Fetches the training plans and session card views from the backend
   * and updates the trainingPlans signal.
   * Combines both results into one array for further use.
   * @returns An Observable of the combined result array.
   */
  loadAndCacheTrainingPlans(): Observable<(TrainingPlanCardView | TrainingSessionCardViewDto)[]> {
    const trainingPlans$: Observable<TrainingPlanCardView[]> = this.httpService.get('/training/plans');
    const trainingSessions$: Observable<TrainingSessionCardViewDto[]> = this.httpService.get('/training-session');

    return forkJoin([trainingPlans$, trainingSessions$]).pipe(
      map(([trainingPlans, trainingSessions]) => [...trainingPlans, ...trainingSessions]),
      tap((combinedResults) => this.trainingPlans.set(combinedResults)),
    );
  }
  /**
   * Gets the current training plans from the signal.
   * Can be used for filtering and other local operations without making additional HTTP requests.
   * @returns The current value of the training plans.
   */
  getTrainingPlans(): TrainingPlanCardView[] {
    return this.trainingPlans();
  }
}
