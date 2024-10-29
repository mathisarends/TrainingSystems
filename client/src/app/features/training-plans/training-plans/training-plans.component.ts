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
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { IconName } from '../../../shared/icon/icon-name';
import { KeyboardService } from '../../../shared/service/keyboard.service';
import { HeaderService } from '../../header/header.service';
import { TrainingSessionService } from '../../training-session/training-session-service';
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
    SpinnerComponent,
  ],
  templateUrl: './training-plans.component.html',
  styleUrls: ['./training-plans.component.scss'],
  providers: [KeyboardService, TrainingSessionService],
  animations: [toggleCollapseAnimation],
})
export class TrainingPlansComponent implements OnInit {
  @ViewChild(SearchBarComponent) searchBar!: SearchBarComponent;
  protected readonly IconName = IconName;

  /**
   * Holds the filtered training plans to display.
   */
  filteredTrainingPlans: WritableSignal<TrainingPlanCardView[]> = signal([]);

  /**
   * Stores the users search quey for training plans.
   */
  trainingPlanSearchQuery = signal<string>('');

  /**
   * Determines if the search bar is collapsed.
   */
  isSearchbarCollapsed = signal<boolean>(true);

  /**
   * Signal indicating whether the data is still loading.
   */
  isLoading = signal(true);

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

  /**
   * Opens the modal to create a new training plan.
   */
  private createNewPlan(): void {
    this.modalService.open({
      component: CreateTrainingComponent,
      title: 'Trainingsplan erstellen',
      buttonText: 'Erstellen',
      secondaryButtonText: 'Session Erstellen',
      size: ModalSize.LARGE,
      confirmationRequired: true,
    });
  }

  /**
   * Sets up the header information, including buttons and options.
   * The header contains controls for creating new plans and toggling the search bar.
   */
  private setHeaderInfo(): void {
    const options = [
      { icon: IconName.PLUS, label: 'Erstellen', callback: this.createNewPlan.bind(this) },
      {
        icon: IconName.Activity,
        label: 'Session',
        callback: () => {},
      },
      { icon: IconName.SEARCH, label: 'Suchen', callback: this.toggleSearchBarVisibility.bind(this) },
    ];

    this.headerService.setHeadlineInfo({
      title: 'Training',
      buttons: [{ icon: IconName.MORE_VERTICAL, options }],
    });
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
        const allPlans = this.trainingPlanService.trainingPlans();

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
}
