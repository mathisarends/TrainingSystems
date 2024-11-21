import { Injectable, signal } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, Subject, tap } from 'rxjs';
import { HttpService } from '../../../../core/services/http-client.service';
import { BasicConfirmationResponse } from '../../../../shared/dto/basic-confirmation-response';
import { TrainingSessionCardViewDto } from '../../../training-session/model/training-session-card-view-dto';
import { TrainingPlanEditView } from '../../model/training-plan-edit-view';
import { TrainingPlanEditViewDto } from '../../model/training-plan-edit-view-dto';
import { TrainingPlanCardView } from '../models/exercise/training-plan-card-view-dto';

@Injectable()
export class TrainingPlanService {
  /**
   * Used to notify components of changes to training plans.
   */
  private trainingPlansChangedSubject = new Subject<void>();

  /**
   * Observable stream for training plan changes.
   */
  trainingPlansChanged$ = this.trainingPlansChangedSubject.asObservable();

  /**
   * Holds the cached training plans.
   */
  trainingPlans = signal<TrainingPlanCardView[]>([]);

  constructor(private httpService: HttpService) {}

  /**
   * Creates a new training plan by sending the data to the backend.
   * Emits a notification when the creation is successful.
   */
  createTrainingPlan(trainingPlanEditView: TrainingPlanEditView): Observable<void> {
    return this.httpService.post<void>('/training', trainingPlanEditView.toCreateDto()).pipe(
      tap(() => {
        this.trainingPlanChanged();
      }),
    );
  }

  getPlanForEdit(id: string): Observable<TrainingPlanEditViewDto> {
    return this.httpService.get<TrainingPlanEditViewDto>(`/training-plan/edit/${id}`);
  }

  editTrainingPlan(id: string, formData: TrainingPlanEditViewDto): Observable<BasicConfirmationResponse> {
    return this.httpService.patch<BasicConfirmationResponse>(`/training-plan/edit/${id}`, formData).pipe(
      tap(() => {
        this.trainingPlanChanged();
      }),
    );
  }

  /**
   * Emits a notification when the training plans have changed.
   * Can be used by components to react to updates in the training plans.
   */
  trainingPlanChanged(): void {
    this.trainingPlansChangedSubject.next();
  }

  /**
   * Fetches the training plans and session card views from the backend
   * and updates the trainingPlans signal.
   * Combines both results into one array for further use.
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
