import { Component, DestroyRef, OnInit } from '@angular/core';
import { ModalService } from '../../../service/modal/modalService';
import { CreateTrainingFormComponent } from '../modal-pages/create-training-form/create-training-form.component';
import { AlertComponent } from '../../components/alert/alert.component';
import { SpinnerComponent } from '../../components/loaders/spinner/spinner.component';
import { TrainingPlanCardView } from '../../../types/exercise/training-plan-card-view-dto';
import { firstValueFrom, BehaviorSubject } from 'rxjs';
import { SearchService } from '../../../service/util/search.service';
import { TrainingPlanService } from '../../../service/training/training-plan.service';
import { CommonModule } from '@angular/common';
import { TooltipDirective } from '../../../service/tooltip/tooltip.directive';
import { TrainingPlanCardComponent } from '../../components/training-plan-card/training-plan-card.component';
import { ModalSize } from '../../../service/modal/modalSize';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HeadlineComponent } from '../../components/headline/headline.component';
import { IconButtonComponent } from '../../components/icon-button/icon-button.component';
import { SkeletonCardComponent } from '../../components/loaders/skeletons/skeleton-card/skeleton-card.component';
import { HttpService } from '../../../service/http/http-client.service';
import { CurrentUserService } from '../../current-user.service';
import { Router } from '@angular/router';
import { IconName } from '../../shared/icon/icon-name';

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
    private currentUserService: CurrentUserService,
    private router: Router,
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
      this.updateColumnClass(plans?.length || 0);
    });

    console.log('urö', this.router.url);
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
  protected createNewPlan(): void {
    this.modalService.open({
      component: CreateTrainingFormComponent,
      title: 'Trainingsplan erstellen',
      buttonText: 'Erstellen',
      size: ModalSize.LARGE,
      confirmationRequired: true,
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
