import { Component, DestroyRef, OnInit } from '@angular/core';
import { ModalService } from '../../../service/modal/modalService';
import { CreateTrainingFormComponent } from '../create-training-form/create-training-form.component';
import { HttpMethods } from '../../types/httpMethods';
import { AlertComponent } from '../../components/alert/alert.component';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { TrainingPlanCardView } from '../../../types/exercise/training-plan-card-view-dto';
import { firstValueFrom, BehaviorSubject } from 'rxjs';
import { SearchService } from '../../../service/util/search.service';
import { TrainingPlanService } from '../../../service/training/training-plan.service';
import { CommonModule } from '@angular/common';
import { TooltipDirective } from '../../../service/tooltip/tooltip.directive';
import { TrainingPlanCardComponent } from '../../components/training-plan-card/training-plan-card.component';
import { ModalSize } from '../../../service/modal/modalSize';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MobileService } from '../../../service/util/mobile.service';
import { AccordionComponent } from '../../accordion/accordion.component';
import { HeadlineComponent } from '../../headline/headline.component';
import { IconButtonComponent } from '../../icon-button/icon-button.component';
import { SkeletonCardComponent } from '../../skeleton-card/skeleton-card.component';
import { HttpService } from '../../../service/http/http.service';

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
    AccordionComponent,
    HeadlineComponent,
    IconButtonComponent,
    SkeletonCardComponent,
  ],
  templateUrl: './training-plans.component.html',
  styleUrls: ['./training-plans.component.scss'],
})
export class TrainingPlansComponent implements OnInit {
  protected allTrainingPlans$ = new BehaviorSubject<TrainingPlanCardView[] | null>(null);
  protected filteredTrainingPlans$ = new BehaviorSubject<TrainingPlanCardView[] | null>(null);

  columnClass!: string; // bestimmt in Abhängig der Anzahl der Pläne welches Grid System benutzt werden soll

  isMobile = false;

  constructor(
    private modalService: ModalService,
    private httpClient: HttpService,
    private searchService: SearchService,
    private trainingPlanService: TrainingPlanService,
    private destroyRef: DestroyRef,
    private mobileService: MobileService,
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
      const amountOfPlans = plans?.length!;

      if (amountOfPlans % 3 === 0) {
        this.columnClass = 'col-lg-4 col-md-6 col-sm-12';
      } else if (amountOfPlans % 2 === 0) {
        this.columnClass = 'col-lg-6 col-md-6 col-sm-12';
      } else if (amountOfPlans === 1) {
        this.columnClass = 'col-lg-12 col-md-12 col-sm-12';
      } else {
        this.columnClass = 'col-lg-4 col-md-6 col-sm-12';
      }
    });

    this.isMobile = this.mobileService.isMobileView();
  }

  /**
   * Loads training plans from the server.
   */
  protected async loadTrainingPlans(): Promise<void> {
    try {
      const response: any = await firstValueFrom(this.httpClient.request<any>(HttpMethods.GET, 'training/plans'));

      this.allTrainingPlans$.next(response?.trainingPlanCards);
      this.filteredTrainingPlans$.next(response?.trainingPlanCards);

      // Mark for change detection
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
   * Filters the training plans based on the search text.
   * @param searchText - The search input text.
   */
  private filterTrainingPlans(searchText: string): void {
    const allPlans = this.allTrainingPlans$.value || [];
    this.filteredTrainingPlans$.next(
      allPlans.filter((trainingPlan) => trainingPlan.title.toLowerCase().includes(searchText.toLowerCase())),
    );
  }
}
