import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, Injector, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, first, Observable } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';
import { ModalService } from '../../../core/services/modal/modalService';
import { ModalSize } from '../../../core/services/modal/modalSize';
import { toggleCollapseAnimation } from '../../../shared/animations/toggle-collapse';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { CircularIconButtonComponent } from '../../../shared/components/circular-icon-button/circular-icon-button.component';
import { SkeletonCardComponent } from '../../../shared/components/loader/skeleton-card/skeleton-card.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { IconName } from '../../../shared/icon/icon-name';
import { HeaderService } from '../../header/header.service';
import { TrainingPlanCardComponent } from '../training-plan-card/training-plan-card.component';
import { CreateTrainingComponent } from '../training-view/create-training/create-training.component';
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
    TrainingPlanCardComponent,
    SkeletonCardComponent,
    CircularIconButtonComponent,
    SearchBarComponent,
    DragDropModule,
  ],
  templateUrl: './training-plans.component.html',
  styleUrls: ['./training-plans.component.scss'],
  animations: [toggleCollapseAnimation],
})
export class TrainingPlansComponent implements OnInit {
  protected readonly IconName = IconName;

  trainingPlans$!: Observable<TrainingPlanCardView[]>;
  filteredTrainingPlans$ = new BehaviorSubject<TrainingPlanCardView[] | null>(null);

  columnClass!: string;

  trainingPlanSearchQuery = signal<string>('');

  searchBarCollapsed = signal<boolean>(true);

  constructor(
    private modalService: ModalService,
    private httpClient: HttpService,
    private headerService: HeaderService,
    private trainingPlanService: TrainingPlanService,
    private injector: Injector,
    private destroyRef: DestroyRef,
  ) {}

  /**
   * Lifecycle hook that runs when the component is initialized.
   * Loads training plans and subscribes to search input and modal events.
   */
  ngOnInit(): void {
    this.setHeaderInfo();

    this.loadTrainingPlans();

    this.trainingPlanService.trainingPlansChanged$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.loadTrainingPlans();
    });

    this.filteredTrainingPlans$.subscribe((trainingPlans) => {
      if (trainingPlans) {
        this.updateColumnClass(trainingPlans.length);
      }
    });

    effect(
      () => {
        this.filterTrainingPlans();
      },
      { injector: this.injector, allowSignalWrites: true },
    );
  }

  protected updateTrainingPlanOrder(event: CdkDragDrop<TrainingPlanCardView[]>) {
    if (!this.filteredTrainingPlans$.value) {
      return;
    }

    moveItemInArray(this.filteredTrainingPlans$.value, event.previousIndex, event.currentIndex);

    this.filteredTrainingPlans$.next([...this.filteredTrainingPlans$.value]);

    const reorderedIds = this.filteredTrainingPlans$.value.map((plan) => plan.id);

    this.trainingPlanService.reorderTrainingPlans(reorderedIds).subscribe();
  }

  /**
   * Loads training plans from the server.
   */
  protected loadTrainingPlans(): void {
    this.trainingPlans$ = this.httpClient.get<TrainingPlanCardView[]>('/training/plans');

    this.trainingPlans$.subscribe((trainingPlans) => {
      this.filteredTrainingPlans$.next(trainingPlans);
    });
  }

  /**
   * Opens the modal to create a new training plan.
   */
  private createNewPlan(): void {
    this.trainingPlans$.pipe(first()).subscribe((trainingPlans) => {
      this.modalService.open({
        component: CreateTrainingComponent,
        title: 'Trainingsplan erstellen',
        buttonText: 'Erstellen',
        secondaryButtonText: 'Optionen',
        size: ModalSize.LARGE,
        confirmationRequired: true,
        componentData: {
          existingPlans: trainingPlans,
        },
      });
    });
  }

  private setHeaderInfo(): void {
    const options = [
      { icon: IconName.SEARCH, label: 'Suchen', callback: this.toggleSearchBarVisibility.bind(this) },
      { icon: IconName.DRAG, label: 'Anordnen', callback: () => {} },
    ];

    this.headerService.setHeadlineInfo({
      title: 'Training',
      buttons: [
        { icon: IconName.PLUS, callback: this.createNewPlan.bind(this) },
        { icon: IconName.MORE_VERTICAL, options },
      ],
    });
  }

  private toggleSearchBarVisibility(): void {
    this.searchBarCollapsed.set(!this.searchBarCollapsed());
  }

  private filterTrainingPlans(): void {
    const searchQuery = this.trainingPlanSearchQuery().toLowerCase();

    this.trainingPlans$.subscribe((trainingPlans) => {
      const filteredPlans = trainingPlans.filter((plan) => plan.title.toLowerCase().includes(searchQuery));

      this.filteredTrainingPlans$.next(filteredPlans);
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
