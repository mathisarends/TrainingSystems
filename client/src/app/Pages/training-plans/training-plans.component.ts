import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalService } from '../../../service/modalService';
import { CreateTrainingFormComponent } from '../../create-training-form/create-training-form.component';
import { EditTrainingPlanComponent } from '../../edit-training-plan/edit-training-plan.component';
import { DeleteConfirmationComponent } from '../../delete-confirmation/delete-confirmation.component';
import { HttpClientService } from '../../../service/http-client.service';
import { HttpMethods } from '../../types/httpMethods';
import { AlertComponent } from '../../components/alert/alert.component';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { TrainingCardsComponent } from '../../components/training-card/training-card.component';
import { BasicTrainingPlanView } from '../../../../../shared/models/dtos/training/trainingDto.types.js';
import { HttpErrorResponse } from '@angular/common/http';
import { ModalEventsService } from '../../../service/modal-events.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { SearchService } from '../../search.service';
import { TrainingPlanService } from '../../training-plan.service';
import { Router } from '@angular/router';

/**
 * Component to manage and display training plans.
 */
@Component({
  selector: 'app-training-plans',
  standalone: true,
  imports: [AlertComponent, SpinnerComponent, TrainingCardsComponent],
  templateUrl: './training-plans.component.html',
  styleUrls: ['./training-plans.component.scss'],
})
export class TrainingPlansComponent implements OnInit, OnDestroy {
  protected allTrainingPlans!: BasicTrainingPlanView[];
  protected filteredTrainingPlans!: BasicTrainingPlanView[];
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
    private router: Router,
    private modalEventsService: ModalEventsService,
    private trainingPlansService: TrainingPlanService,
    private searchService: SearchService
  ) {}

  /**
   * Lifecycle hook that runs when the component is initialized.
   * Loads training plans and subscribes to search input and modal events.
   */
  async ngOnInit(): Promise<void> {
    await this.loadTrainingPlans();

    // Subscribe to the confirmClick$ event to handle deletion confirmation
    this.modalEventsService.confirmClick$.subscribe(() => {
      this.handleDelete(this.currentSelectedId);
    });

    this.trainingPlansService.trainingPlansChanged$.subscribe(() => {
      console.log('received change');
      this.loadTrainingPlans();
    });

    // Subscribe to search input changes
    this.searchSubscription = this.searchService.searchText$.subscribe(
      (searchText) => {
        console.log(
          '🚀 ~ TrainingPlansComponent ~ ngOnInit ~ searchText:',
          searchText
        );
        this.filterTrainingPlans(searchText);
      }
    );
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
      console.log(
        '🚀 ~ TrainingPlansComponent ~ loadTrainingPlans ~ this.allTrainingPlans :',
        this.allTrainingPlans
      );
      this.filteredTrainingPlans = this.allTrainingPlans;
    } catch (error) {
      console.error('Error loading training plans:', error);
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
      'Erstellen'
    );
  }

  /**
   * Opens the modal to delete a training plan.
   * @param index - The index of the training plan to delete.
   */
  deleteTrainingPlan(id: string): void {
    this.currentSelectedId = id;
    this.modalService.open(
      DeleteConfirmationComponent,
      'Trainingsplan wirklich löschen?',
      'Löschen'
    );
  }

  /**
   * Opens the modal to view a training plan.
   * @param index - The index of the training plan to view.
   */
  viewTrainingPlan(id: string): void {
    const week = 1; // Annahme: Woche ist 1
    const day = 1; // Annahme: Tag ist 1
    this.router.navigate(['/training/view'], {
      queryParams: {
        planId: id,
        week: week,
        day: day,
      },
    });
  }

  /**
   * Opens the modal to edit a training plan.
   * @param index - The index of the training plan to edit.
   */
  editTrainingPlan(id: string): void {
    console.log('🚀 ~ TrainingPlansComponent ~ editTrainingPlan ~ id:', id);
    this.modalService.open(
      EditTrainingPlanComponent,
      'Trainingsplan bearbeiten',
      'Übernehmen',
      { id }
    );
  }

  /**
   * Handles the deletion of a training plan.
   * @param index - The index of the training plan to delete.
   */
  private async handleDelete(id: string): Promise<void> {
    if (id) {
      try {
        const response: any = await firstValueFrom(
          this.httpClient.request<any>(
            HttpMethods.DELETE,
            `training/delete/${id}`
          )
        );

        // Find the index of the plan by id and splice it
        const planIndex = this.allTrainingPlans.findIndex(
          (plan) => plan.id === id
        );
        if (planIndex > -1) {
          this.allTrainingPlans.splice(planIndex, 1);
        }

        this.modalService.close();
      } catch (error) {
        console.error('Error deleting training plan:', error);
        if (error instanceof HttpErrorResponse && error.status === 404) {
          console.log('Route oder Nutzer nicht gefunden');
        }
      }
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
