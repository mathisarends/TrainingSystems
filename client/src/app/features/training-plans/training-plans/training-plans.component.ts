import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, Injector, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalService } from '../../../core/services/modal/modalService';
import { ModalSize } from '../../../core/services/modal/modalSize';
import { toggleCollapseAnimation } from '../../../shared/animations/toggle-collapse';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { CircularIconButtonComponent } from '../../../shared/components/circular-icon-button/circular-icon-button.component';
import { SkeletonCardComponent } from '../../../shared/components/loader/skeleton-card/skeleton-card.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { IconName } from '../../../shared/icon/icon-name';
import { KeyboardService } from '../../../shared/service/keyboard.service';
import { HeaderService } from '../../header/header.service';
import { TrainingSessionService } from '../../training-session/training-session-service';
import { TrainingPlanCardComponent } from '../training-plan-card/training-plan-card.component';
import { CreateTrainingComponent } from '../training-view/create-training/create-training.component';
import { TrainingPlanCardView } from '../training-view/models/exercise/training-plan-card-view-dto';
import { TrainingPlanType } from '../training-view/models/training-plan-type';
import { TrainingPlanService } from '../training-view/services/training-plan.service';
import { TrainingTypeSelect } from './training-type-select/training-type-select.component';

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
    TrainingTypeSelect,
  ],
  templateUrl: './training-plans.component.html',
  styleUrls: ['./training-plans.component.scss'],
  providers: [KeyboardService, TrainingSessionService],
  animations: [toggleCollapseAnimation],
})
export class TrainingPlansComponent implements OnInit {
  @ViewChild(SearchBarComponent) searchBar!: SearchBarComponent;
  protected readonly IconName = IconName;

  filteredTrainingPlans: WritableSignal<TrainingPlanCardView[]> = signal([]);

  trainingPlanSearchQuery = signal<string>('');

  isSearchbarCollapsed = signal<boolean>(true);

  isDragMode = signal(false);

  isLoading = signal(true);

  columnClass!: string;

  constructor(
    protected trainingPlanService: TrainingPlanService,

    private modalService: ModalService,
    private headerService: HeaderService,
    private keyboardService: KeyboardService,
    private injector: Injector,
    private destroyRef: DestroyRef,
  ) {}

  /**
   * Lifecycle hook that runs when the component is initialized.
   * Loads training plans, subscribes to search input and modal events, and listens for "Ctrl + F".
   */
  ngOnInit(): void {
    this.setHeaderInfo();

    this.loadTrainingPlans();

    this.trainingPlanService.trainingPlansChanged$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.loadTrainingPlans();
    });

    effect(
      () => {
        this.updateColumnClass(this.filteredTrainingPlans().length);
      },
      { allowSignalWrites: true, injector: this.injector },
    );

    this.setupKeyBoardEventListeners();

    this.setupFilterLogic();
  }

  /**
   * Handles reordering of training plans via drag-and-drop and updates the order on the server.
   * @param event - The drag-and-drop event that contains the previous and new indices.
   */
  protected updateTrainingPlanOrder(event: CdkDragDrop<TrainingPlanCardView[]>) {
    moveItemInArray(this.filteredTrainingPlans(), event.previousIndex, event.currentIndex);
    const reorderedIds = this.filteredTrainingPlans().map((plan) => plan.id);
    this.trainingPlanService.reorderTrainingPlans(reorderedIds).subscribe();
  }

  /**
   * Loads training plans from the server.
   */
  protected loadTrainingPlans(): void {
    this.trainingPlanService.loadAndCacheTrainingPlans().subscribe((combinedResults) => {
      this.filteredTrainingPlans.set(combinedResults);
      this.isLoading.set(false);
    });
  }

  private openCreateTrainingSessionModal(): void {
    this.modalService.open({
      component: CreateTrainingComponent,
      title: 'Training erstellen',
      buttonText: 'Erstellen',
      size: ModalSize.LARGE,
      confirmationRequired: true,
      componentData: {
        trainingPlanTyp: TrainingPlanType.SESSION,
      },
    });
  }

  /**
   * Opens the modal to create a new training plan.
   */
  private createNewPlan(): void {
    this.modalService.open({
      component: CreateTrainingComponent,
      title: 'Trainingsplan erstellen',
      buttonText: 'Erstellen',
      secondaryButtonText: 'Optionen',
      size: ModalSize.LARGE,
      confirmationRequired: true,
      componentData: {
        existingPlans: this.trainingPlanService.getTrainingPlans(),
      },
    });
  }

  /**
   * Sets up the header information, including buttons and options.
   * The header contains controls for creating new plans and toggling the search bar.
   */
  private setHeaderInfo(): void {
    const options = [
      { icon: IconName.SEARCH, label: 'Suchen', callback: this.toggleSearchBarVisibility.bind(this) },
      { icon: IconName.DRAG, label: 'Anordnen', callback: this.toggleDragMode.bind(this) },
    ];

    this.headerService.setHeadlineInfo({
      title: 'Training',
      buttons: [
        { icon: IconName.PLUS, callback: this.createNewPlan.bind(this) },
        { icon: IconName.Zap, callback: this.openCreateTrainingSessionModal.bind(this) },
        { icon: IconName.MORE_VERTICAL, options },
      ],
    });
  }

  /**
   * Toggles the mode in which training plan cards may be dragged
   */
  private toggleDragMode(): void {
    this.isDragMode.set(!this.isDragMode());
  }

  /**
   * Toggles the visibility of the search bar.
   * If expanded, the search input is focused automatically.
   */
  private toggleSearchBarVisibility(): void {
    this.isSearchbarCollapsed.set(!this.isSearchbarCollapsed());

    if (!this.isSearchbarCollapsed()) {
      this.searchBar.focusInput();
    }
  }

  /**
   * Setup for filter logic.
   * Filters the training plans based on the search query and updates the filtered plans.
   */
  private setupFilterLogic(): void {
    effect(
      () => {
        const searchQuery = this.trainingPlanSearchQuery().toLowerCase();
        const allPlans = this.trainingPlanService.getTrainingPlans();

        if (!allPlans) return;

        const filteredPlans = allPlans.filter((plan) => {
          const matchesSearchQuery = plan.title.toLowerCase().includes(searchQuery);
          return matchesSearchQuery;
        });

        this.filteredTrainingPlans.set(filteredPlans);
      },
      { injector: this.injector, allowSignalWrites: true },
    );
  }

  /**
   * Sets up the keyboard event listener for the search functionality.
   */
  private setupKeyBoardEventListeners(): void {
    this.keyboardService
      .ctrlFPressed$()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event: KeyboardEvent) => {
        event.preventDefault();
        this.toggleSearchBarVisibility();
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
