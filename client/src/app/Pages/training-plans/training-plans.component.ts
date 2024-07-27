import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalService } from '../../../service/modal/modalService';
import { CreateTrainingFormComponent } from '../create-training-form/create-training-form.component';
import { HttpClientService } from '../../../service/http/http-client.service';
import { HttpMethods } from '../../types/httpMethods';
import { AlertComponent } from '../../components/alert/alert.component';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { TrainingPlanCardView } from '../../../../../shared/models/dtos/training/trainingDto.types.js';
import { firstValueFrom, Subscription } from 'rxjs';
import { SearchService } from '../../../service/util/search.service';
import { TrainingPlanService } from '../../../service/training/training-plan.service';
import { CommonModule } from '@angular/common';
import { TooltipDirective } from '../../../service/tooltip/tooltip.directive';
import { TrainingPlanCardComponent } from '../../components/training-plan-card/training-plan-card.component';
import { ModalSize } from '../../../service/modal/modalSize';

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
  protected allTrainingPlans!: TrainingPlanCardView[];
  protected filteredTrainingPlans!: TrainingPlanCardView[];
  protected isLoading: boolean = true;
  private searchSubscription!: Subscription;

  constructor(
    private modalService: ModalService,
    private httpClient: HttpClientService,
    private searchService: SearchService,
    private trainingPlanService: TrainingPlanService
  ) {}

  /**
   * Lifecycle hook that runs when the component is initialized.
   * Loads training plans and subscribes to search input and modal events.
   */
  async ngOnInit(): Promise<void> {
    await this.loadTrainingPlans();
    this.subscribeToSearch();
    this.subscribeToTrainingPlanChanges();
  }

  /**
   * Lifecycle hook that runs when the component is destroyed.
   * Unsubscribes from subscriptions to avoid memory leaks.
   */
  ngOnDestroy(): void {
    this.unsubscribeFromAll();
  }

  /**
   * Loads training plans from the server.
   */
  private async loadTrainingPlans(): Promise<void> {
    this.isLoading = true;
    try {
      const response: any = await firstValueFrom(
        this.httpClient.request<any>(HttpMethods.GET, 'training/plans')
      );
      this.allTrainingPlans = response.trainingPlanDtos;
      this.filteredTrainingPlans = this.allTrainingPlans;
    } catch (error) {
      console.error('Fehler beim Laden:', error);
    } finally {
      this.isLoading = false;
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
    this.filteredTrainingPlans = this.allTrainingPlans?.filter(
      (trainingPlan) => {
        return trainingPlan.title
          .toLowerCase()
          .includes(searchText.toLowerCase());
      }
    );
  }

  /**
   * Subscribes to the search input changes.
   */
  private subscribeToSearch(): void {
    this.searchSubscription = this.searchService.searchText$.subscribe(
      (searchText) => {
        this.filterTrainingPlans(searchText);
      }
    );
  }

  /**
   * Subscribes to training plan changes.
   */
  private subscribeToTrainingPlanChanges(): void {
    this.trainingPlanService.trainingPlansChanged$.subscribe(() => {
      this.loadTrainingPlans();
    });
  }

  /**
   * Unsubscribes from all subscriptions to avoid memory leaks.
   */
  private unsubscribeFromAll(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  /**
   * Determines the column class based on the index.
   * @param index - The index of the training plan.
   * @returns {string} - The column class.
   */
  getColumnClass(index: number): string {
    const totalItems = this.filteredTrainingPlans.length;
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
