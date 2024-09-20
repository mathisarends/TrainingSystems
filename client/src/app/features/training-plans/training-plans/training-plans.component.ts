import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, Injector, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';
import { ModalService } from '../../../core/services/modal/modalService';
import { ModalSize } from '../../../core/services/modal/modalSize';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { CircularIconButtonComponent } from '../../../shared/components/circular-icon-button/circular-icon-button.component';
import { HeadlineComponent } from '../../../shared/components/headline/headline.component';
import { IconButtonComponent } from '../../../shared/components/icon-button/icon-button.component';
import { SkeletonCardComponent } from '../../../shared/components/loader/skeleton-card/skeleton-card.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { TooltipDirective } from '../../../shared/directives/tooltip.directive';
import { IconName } from '../../../shared/icon/icon-name';
import { IconComponent } from '../../../shared/icon/icon.component';
import { ButtonClickService } from '../../../shared/service/button-click.service';
import { TrainingPlanCardComponent } from '../training-plan-card/training-plan-card.component';
import { CreateTrainingFormComponent } from '../training-view/create-training-form/create-training-form.component';
import { TrainingPlanCardView } from '../training-view/models/exercise/training-plan-card-view-dto';
import { TrainingPlanService } from '../training-view/services/training-plan.service';

/**
 * Component to manage and display training plans.
 */
@Component({
  selector: 'app-training-plans',
  standalone: true,
  imports: [
    AlertComponent,
    CommonModule,
    TooltipDirective,
    TrainingPlanCardComponent,
    HeadlineComponent,
    IconButtonComponent,
    SkeletonCardComponent,
    IconComponent,
    CircularIconButtonComponent,
    SearchBarComponent,
  ],
  templateUrl: './training-plans.component.html',
  styleUrls: ['./training-plans.component.scss'],
})
export class TrainingPlansComponent implements OnInit {
  protected readonly IconName = IconName;

  protected allTrainingPlans$ = new BehaviorSubject<TrainingPlanCardView[] | null>(null);
  protected filteredTrainingPlans$ = new BehaviorSubject<TrainingPlanCardView[] | null>(null);

  columnClass!: string; // bestimmt in Abhängig der Anzahl der Pläne welches Grid System benutzt werden soll

  trainingPlanSearchQuery = signal<string>('');

  constructor(
    private modalService: ModalService,
    private httpClient: HttpService,
    private trainingPlanService: TrainingPlanService,
    private buttonClickService: ButtonClickService,
    private destroyRef: DestroyRef,
    private injector: Injector,
  ) {}

  /**
   * Lifecycle hook that runs when the component is initialized.
   * Loads training plans and subscribes to search input and modal events.
   */
  async ngOnInit(): Promise<void> {
    await this.loadTrainingPlans();

    this.trainingPlanService.trainingPlansChanged$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.loadTrainingPlans();
    });

    this.filteredTrainingPlans$.subscribe((plans) => {
      this.updateColumnClass(plans?.length ?? 0);
    });

    this.buttonClickService.buttonClick$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.createNewPlan();
    });

    effect(
      () => {
        const allPlans = this.allTrainingPlans$.value || [];
        this.filteredTrainingPlans$.next(
          allPlans.filter((trainingPlan) =>
            trainingPlan.title.toLowerCase().includes(this.trainingPlanSearchQuery().toLowerCase()),
          ),
        );
      },
      { injector: this.injector },
    );
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
