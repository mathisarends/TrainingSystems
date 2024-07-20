import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalService } from '../../../service/modalService';
import { CreateTrainingFormComponent } from '../../create-training-form/create-training-form.component';
import { EditTrainingPlanComponent } from '../../edit-training-plan/edit-training-plan.component';
import { DeleteConfirmationComponent } from '../../delete-confirmation/delete-confirmation.component';
import { HttpClientService } from '../../../service/http-client.service';
import { HttpMethods } from '../../types/httpMethods';
import { AlertComponent } from '../../components/alert/alert.component';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { TrainingPlanCardView } from '../../../../../shared/models/dtos/training/trainingDto.types.js';
import { HttpErrorResponse } from '@angular/common/http';
import { ModalEventsService } from '../../../service/modal-events.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { SearchService } from '../../search.service';
import { TrainingPlanService } from '../../training-plan.service';
import { Router } from '@angular/router';
import { ModalSize } from '../../../service/modalSize';
import { CommonModule } from '@angular/common';
import { TooltipDirective } from '../../tooltip/tooltip.directive';
import { TrainingPlanCardComponent } from '../../training-plan-card/training-plan-card.component';

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
  private currentSelectedId: string = '';
  private searchSubscription!: Subscription;

  /**
   * Constructor to initialize dependencies.
   * @param modalService - Service to handle modal operations.
   * @param httpClient - Service to handle HTTP requests.
   * @param modalEventsService - Service to handle modal events.
   * @param searchService - Service to handle search input.
   */
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
    // Subscribe to search input changes
    this.searchSubscription = this.searchService.searchText$.subscribe(
      (searchText) => {
        this.filterTrainingPlans(searchText);
      }
    );

    this.trainingPlanService.trainingPlansChanged$.subscribe(() => {
      this.loadTrainingPlans();
    });
  }

  /**
   * Lifecycle hook that runs when the component is destroyed.
   * Unsubscribes from subscriptions to avoid memory leaks.
   */
  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }

  /**
   * Loads training plans from the server.
   */
  private async loadTrainingPlans(): Promise<void> {
    try {
      const response: any = await firstValueFrom(
        this.httpClient.request<any>(HttpMethods.GET, 'training/plans')
      );
      this.allTrainingPlans = response.trainingPlanDtos;

      this.filteredTrainingPlans = this.allTrainingPlans;
    } catch (error) {
      console.error('Fehler beim Laden');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Opens the modal to create a new training plan.
   */
  createNewPlan(): void {
    this.modalService.open(
      CreateTrainingFormComponent,
      'Trainingsplan erstellen',
      'Erstellen',
      ModalSize.LARGE
    );
  }

  /**
   * Handles the event when the training plan constellation has changed (e.g., a plan was deleted).
   */
  onChangedPlanConstellation(): void {
    this.loadTrainingPlans();
  }

  getColumnClass(index: number) {
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
}
