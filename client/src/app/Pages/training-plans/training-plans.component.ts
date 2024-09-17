import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { TrainingPlanService } from '../../../service/training/training-plan.service';
import { TrainingPlanCardView } from '../../../types/exercise/training-plan-card-view-dto';
import { SkeletonCardComponent } from '../../components/loaders/skeletons/skeleton-card/skeleton-card.component';
import { TrainingPlanCardComponent } from '../../components/training-plan-card/training-plan-card.component';
import { HttpService } from '../../core/http-client.service';
import { SearchService } from '../../core/search.service';
import { ModalService } from '../../core/services/modal/modalService';
import { ModalSize } from '../../core/services/modal/modalSize';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { CircularIconButtonComponent } from '../../shared/components/circular-icon-button/circular-icon-button.component';
import { HeadlineComponent } from '../../shared/components/headline/headline.component';
import { IconButtonComponent } from '../../shared/components/icon-button/icon-button.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { TooltipDirective } from '../../shared/directives/tooltip.directive';
import { IconName } from '../../shared/icon/icon-name';
import { IconComponent } from '../../shared/icon/icon.component';
import { CreateTrainingFormComponent } from '../modal-pages/create-training-form/create-training-form.component';

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
    HeadlineComponent,
    IconButtonComponent,
    SkeletonCardComponent,
    IconComponent,
    CircularIconButtonComponent,
  ],
  templateUrl: './training-plans.component.html',
  styleUrls: ['./training-plans.component.scss'],
})
export class TrainingPlansComponent implements OnInit {
  protected readonly IconName = IconName;

  protected allTrainingPlans$ = new BehaviorSubject<TrainingPlanCardView[] | null>(null);
  protected filteredTrainingPlans$ = new BehaviorSubject<TrainingPlanCardView[] | null>(null);

  columnClass!: string; // bestimmt in Abhängig der Anzahl der Pläne welches Grid System benutzt werden soll

  constructor(
    private modalService: ModalService,
    private httpClient: HttpService,
    private searchService: SearchService,
    private trainingPlanService: TrainingPlanService,
    private destroyRef: DestroyRef,
  ) {}

  /**
   * Lifecycle hook that runs when the component is initialized.
   * Loads training plans and subscribes to search input and modal events.
   */
  async ngOnInit(): Promise<void> {
    await this.loadTrainingPlans();

    this.searchService.searchText$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((searchText) => {
      this.filterTrainingPlans(searchText);
    });

    this.trainingPlanService.trainingPlansChanged$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.loadTrainingPlans();
    });

    this.filteredTrainingPlans$.subscribe((plans) => {
      this.updateColumnClass(plans?.length ?? 0);
    });
  }

  /**
   * Loads training plans from the server.
   */
  protected async loadTrainingPlans(): Promise<void> {
    const response: any = await firstValueFrom(this.httpClient.get<any>('/training/plans'));

    this.allTrainingPlans$.next(response?.trainingPlanCards);
    this.filteredTrainingPlans$.next(response?.trainingPlanCards);
  }

  /**
   * Opens the modal to create a new training plan.
   */
  protected async createNewPlan(): Promise<void> {
    const trainingPlans = await firstValueFrom(this.allTrainingPlans$);

    this.modalService.open({
      component: CreateTrainingFormComponent,
      title: 'Trainingsplan erstellen',
      buttonText: 'Erstellen',
      secondaryButtonText: 'Optionen',
      size: ModalSize.LARGE,
      confirmationRequired: true,
      componentData: {
        existingPlans: trainingPlans,
      },
    });
  }

  /**
   * Filters the training plans based on the search text.
   * @param searchText - The search input text.
   */
  private filterTrainingPlans(searchText: string): void {
    const allPlans = this.allTrainingPlans$.value || [];
    this.filteredTrainingPlans$.next(
      allPlans.filter((trainingPlan) => trainingPlan.title.toLowerCase().includes(searchText.toLowerCase())),
    );
  }

  /**
   * Updates the column class based on the number of training plans.
   * @param amountOfPlans - The number of training plans.
   */
  private updateColumnClass(amountOfPlans: number): void {
    switch (true) {
      case amountOfPlans === 1:
        this.columnClass = 'col-lg-12 col-md-12 col-sm-12';
        break;
      case amountOfPlans % 3 === 0:
        this.columnClass = 'col-lg-4 col-md-6 col-sm-12';
        break;
      case amountOfPlans % 2 === 0:
        this.columnClass = 'col-lg-6 col-md-6 col-sm-12';
        break;
      default:
        this.columnClass = 'col-lg-4 col-md-6 col-sm-12';
        break;
    }
  }
}
