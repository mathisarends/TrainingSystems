import { Component, DestroyRef, OnDestroy, OnInit } from '@angular/core';
import { ModalService } from '../../../service/modal/modalService';
import { CreateTrainingFormComponent } from '../create-training-form/create-training-form.component';
import { HttpClientService } from '../../../service/http/http-client.service';
import { HttpMethods } from '../../types/httpMethods';
import { AlertComponent } from '../../components/alert/alert.component';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { TrainingPlanCardView } from '../../../../../shared/models/dtos/training/trainingDto.types.js';
import { firstValueFrom, BehaviorSubject } from 'rxjs';
import { SearchService } from '../../../service/util/search.service';
import { TrainingPlanService } from '../../../service/training/training-plan.service';
import { CommonModule } from '@angular/common';
import { TooltipDirective } from '../../../service/tooltip/tooltip.directive';
import { TrainingPlanCardComponent } from '../../components/training-plan-card/training-plan-card.component';
import { ModalSize } from '../../../service/modal/modalSize';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Component to manage and display training plans.
 */
@Component({
  selector: 'app-training-plans',
  standalone: true,
  imports: [
    AlertComponent,
    SpinnerComponent,
    CommonModule,
    TooltipDirective,
    TrainingPlanCardComponent,
  ],
  templateUrl: './training-plans.component.html',
  styleUrls: ['./training-plans.component.scss'],
})
export class TrainingPlansComponent implements OnInit, OnDestroy {
  protected allTrainingPlans$ = new BehaviorSubject<
    TrainingPlanCardView[] | null
  >(null);
  protected filteredTrainingPlans$ = new BehaviorSubject<
    TrainingPlanCardView[] | null
  >(null);

  constructor(
    private modalService: ModalService,
    private httpClient: HttpClientService,
    private searchService: SearchService,
    private trainingPlanService: TrainingPlanService,
    private destroyRef: DestroyRef
  ) {}

  /**
   * Lifecycle hook that runs when the component is initialized.
   * Loads training plans and subscribes to search input and modal events.
   */
  async ngOnInit(): Promise<void> {
    await this.loadTrainingPlans();

    this.searchService.searchText$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((searchText) => {
        this.filterTrainingPlans(searchText);
      });

    this.trainingPlanService.trainingPlansChanged$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadTrainingPlans();
      });
  }

  /**
   * Lifecycle hook that runs when the component is destroyed.
   * Unsubscribes from subscriptions to avoid memory leaks.
   */
  ngOnDestroy(): void {}

  /**
   * Loads training plans from the server.
   */
  private async loadTrainingPlans(): Promise<void> {
    try {
      const response: any = await firstValueFrom(
        this.httpClient.request<any>(HttpMethods.GET, 'training/plans')
      );
      this.allTrainingPlans$.next(response.trainingPlanDtos);
      this.filteredTrainingPlans$.next(response.trainingPlanDtos);
    } catch (error) {
      console.error('Fehler beim Laden:', error);
      this.allTrainingPlans$.next([]);
      this.filteredTrainingPlans$.next([]);
    }
  }

  /**
   * Opens the modal to create a new training plan.
   */
  createNewPlan(): void {
    this.modalService.open({
      component: CreateTrainingFormComponent,
      title: 'Trainingsplan erstellen',
      buttonText: 'Erstellen',
      size: ModalSize.LARGE,
      confirmationRequired: true,
    });
  }

  /**
   * Handles the event when the training plan constellation has changed (e.g., a plan was deleted).
   */
  onChangedPlanConstellation(): void {
    this.loadTrainingPlans();
  }

  /**
   * Filters the training plans based on the search text.
   * @param searchText - The search input text.
   */
  private filterTrainingPlans(searchText: string): void {
    const allPlans = this.allTrainingPlans$.value || [];
    this.filteredTrainingPlans$.next(
      allPlans.filter((trainingPlan) =>
        trainingPlan.title.toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }

  /**
   * Determines the column class based on the index.
   * @returns {string} - The column class.
   */
  getColumnClass(): string {
    const totalItems = this.filteredTrainingPlans$.value?.length || 0;
    if (totalItems % 3 === 0) {
      return 'col-lg-4 col-md-6 col-sm-12';
    } else if (totalItems % 2 === 0) {
      return 'col-lg-6 col-md-6 col-sm-12';
    } else if (totalItems === 1) {
      return 'col-lg-12 col-md-12 col-sm-12';
    } else {
      // Default to 3-column layout if not perfectly divisible
      return 'col-lg-4 col-md-6 col-sm-12';
    }
  }
}
