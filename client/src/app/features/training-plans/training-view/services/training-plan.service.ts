import { Injectable, signal } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
import { HttpService } from '../../../../core/services/http-client.service';
import { BasicConfirmationResponse } from '../../../../shared/dto/basic-confirmation-response';
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
   * Fetches the training plans from the backend and updates the trainingPlans signal.
   * If the plans are already cached, it uses the cached version for local filtering operations.
   * @returns An Observable of the fetched TrainingPlanCardView array.
   */
  loadAndCacheTrainingPlans(): Observable<TrainingPlanCardView[]> {
    return this.httpService
      .get<TrainingPlanCardView[]>('/training/plans')
      .pipe(tap((plans) => this.trainingPlans.set(plans)));
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
