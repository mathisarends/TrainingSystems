import {
  Component,
  OnInit,
  AfterViewChecked,
  ViewChildren,
  ElementRef,
  QueryList,
  ViewChild,
  DestroyRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TrainingViewService } from './training-view-service';
import { FormService } from '../../../service/form/form.service';
import { EstMaxService } from '../../../service/training/estmax.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../components/toast/toast.service';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { ExerciseDataDTO } from './exerciseDataDto';
import { TrainingPlanDto } from './trainingPlanDto';
import { TrainingViewNavigationService } from './training-view-navigation.service';
import { forkJoin, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SwipeService } from '../../../service/swipe/swipe.service';
import { MobileService } from '../../../service/util/mobile.service';
import { AutoProgressionComponent } from '../modal-pages/auto-progression/auto-progression.component';
import { PauseTimeService } from '../../../service/training/pause-time.service';
import { ModalService } from '../../../service/modal/modalService';
import { RestTimerComponent } from '../modal-pages/rest-timer/rest-timer.component';
import { BasicInfoComponent } from '../modal-pages/basic-info/basic-info.component';
import { HeadlineComponent } from '../../components/headline/headline.component';
import { IconButtonComponent } from '../../components/icon-button/icon-button.component';
import { SkeletonTrainingTableComponent } from '../../components/loaders/skeletons/skeleton-training-table/skeleton-training-table.component';
import { BrowserCheckService } from '../../browser-check.service';
import { InteractiveElementService } from '../../../service/util/interactive-element.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WeightInputDirective } from '../../../directives/weight-input.directive';
import { RpeInputDirective } from '../../../directives/rpe-input.directive';
import { CategorySelectDirective } from '../../../directives/category-select.directive';
import { ExerciseDataService } from './exercise-data.service';
import { InteractiveElementDirective } from '../../../directives/interactive-element.directive';
import { ToastStatus } from '../../components/toast/toast-status';

/**
 * Component to manage and display the training view.
 * Handles loading of training data, swipe gestures, and form submissions.
 */
@Component({
  selector: 'app-training-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PaginationComponent,
    HeadlineComponent,
    IconButtonComponent,
    SkeletonTrainingTableComponent,
    WeightInputDirective,
    RpeInputDirective,
    CategorySelectDirective,
    InteractiveElementDirective,
  ],
  providers: [TrainingViewService],
  templateUrl: './training-view.component.html',
  styleUrls: ['./training-view.component.scss'],
})
export class TrainingViewComponent implements OnInit, AfterViewChecked {
  title = '';
  trainingWeekIndex: number = 0;
  trainingDayIndex: number = 0;

  protected planId!: string;
  exerciseData: ExerciseDataDTO = new ExerciseDataDTO();
  trainingPlanData: TrainingPlanDto = new TrainingPlanDto();
  private dataViewLoaded = new BehaviorSubject<boolean>(false);
  dataViewLoaded$ = this.dataViewLoaded.asObservable();

  private automationContextInitialized = false;
  isMobile = false;

  subHeading: string = '';

  @ViewChild('trainingTable', { static: false }) trainingTable!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private trainingViewService: TrainingViewService,
    private formService: FormService,
    private estMaxService: EstMaxService,
    private toastService: ToastService,
    private navigationService: TrainingViewNavigationService,
    private swipeService: SwipeService,
    private pauseTimeService: PauseTimeService,
    private mobileService: MobileService,
    private modalService: ModalService,
    private browserCheckService: BrowserCheckService,
    private interactiveElementService: InteractiveElementService,
    private exerciseDataService: ExerciseDataService,
    private destroyRef: DestroyRef,
  ) {}

  /**
   * Initializes the component.
   * Subscribes to route parameters and loads the initial data.
   */
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.planId = params['planId'];
      this.trainingWeekIndex = parseInt(params['week']);
      this.trainingDayIndex = parseInt(params['day']);

      this.subHeading = `W${this.trainingWeekIndex + 1}D${this.trainingDayIndex + 1}`;

      this.loadData(this.planId, this.trainingWeekIndex, this.trainingDayIndex);
    });

    this.isMobile = this.mobileService.isMobileView();

    this.interactiveElementService.inputChanged$
      .pipe(takeUntilDestroyed(this.destroyRef)) // Automatically unsubscribe
      .subscribe(() => {
        this.saveTrainingData();
      });
  }

  /**
   * Lifecycle hook that is called after the component's view has been checked.
   * Initializes the swipe listener once the data view has loaded.
   */
  ngAfterViewChecked(): void {
    if (this.browserCheckService.isBrowser() && !this.automationContextInitialized) {
      if (this.dataViewLoaded.getValue() && this.trainingTable) {
        this.initializeSwipeListener();

        this.estMaxService.initializeEstMaxCalculation();
        this.pauseTimeService.initializePauseTimers(this.exerciseData);

        this.automationContextInitialized = true;
      }
    }
  }

  /**
   * Initializes the swipe listener on the training table element.
   * Registers callbacks for left and right swipe gestures.
   */
  initializeSwipeListener(): void {
    if (this.trainingTable) {
      this.swipeService.addSwipeListener(
        this.trainingTable.nativeElement,
        () => this.onPageChanged(this.trainingDayIndex + 1),
        () => this.onPageChanged(this.trainingDayIndex - 1),
        () => {
          this.navigateWeek(-1);
        },
        () => {
          this.navigateWeek(1);
        },
      );
    }
  }

  /**
   * Removes the swipe listener.
   * Calls the swipe service to remove the registered listeners.
   */
  removeSwipeListener(): void {
    this.swipeService.removeSwipeListener();
  }

  /**
   * Loads training data and exercise data for the specified plan, week, and day.
   * Updates the component state with the loaded data.
   * @param planId - ID of the training plan.
   * @param week - Index of the training week.
   * @param day - Index of the training day.
   */
  loadData(planId: string, week: number, day: number): void {
    this.dataViewLoaded.next(false);
    forkJoin({
      trainingPlan: this.trainingViewService.loadTrainingPlan(planId, week, day),
      exerciseData: this.trainingViewService.loadExerciseData(),
    })
      .pipe(
        tap(({ trainingPlan, exerciseData }) => {
          this.trainingPlanData = trainingPlan;

          this.exerciseData = exerciseData;
          this.exerciseDataService.exerciseData = exerciseData;

          this.title = trainingPlan?.title;
        }),
        tap(() => {
          if (this.trainingPlanData && this.exerciseData && this.title) {
            this.dataViewLoaded.next(true);
            this.removeSwipeListener();
            this.initializeSwipeListener();
          } else {
            this.dataViewLoaded.next(false);
          }
        }),
      )
      .subscribe();
  }

  /**
   * Handles form submission.
   * Prevents default form submission, collects changed data, and submits the training plan.
   * @param event - The form submission event.
   */
  onSubmit(event: Event): void {
    event.preventDefault();
    const changedData = this.formService.getChanges();

    this.trainingViewService
      .submitTrainingPlan(this.planId, this.trainingWeekIndex, this.trainingDayIndex, changedData)
      .pipe(
        tap(() => {
          this.formService.clearChanges();
        }),
        catchError((error) => {
          this.toastService.show('Erfolg', 'Daten konnten nicht gespeichtert werden', ToastStatus.ERROR);

          console.error('Error updating training plan:', error);
          return [];
        }),
      )
      .subscribe();
  }

  saveTrainingData() {
    this.onSubmit(new Event('submit'));
  }

  /**
   * Handles page change events.
   * Checks for unsaved data and
   */
  async onPageChanged(day: number): Promise<void> {
    if (this.formService.hasUnsavedChanges()) {
      const confirmed = await this.modalService.open({
        component: BasicInfoComponent,
        title: 'Ungespeicherte Änderungen',
        buttonText: 'Änderungen verwerfen',
        componentData: {
          text: 'Es gibt ungespeicherte Änderungen. Möchtest du wirklich fortfahren und die Änderungen verwerfen?',
        },
      });

      if (confirmed) this.navigateDay(day);
    } else {
      this.navigateDay(day);
    }
  }

  navigateDay(day: number) {
    if (day >= this.trainingPlanData.trainingBlockLength) {
      day = 0;
    } else if (day < 0) {
      day = this.trainingPlanData.trainingBlockLength - 1;
    }

    this.trainingDayIndex = this.navigationService.navigateDay(
      day,
      this.trainingPlanData.trainingFrequency,
      this.trainingWeekIndex,
    );

    this.automationContextInitialized = false;
    this.loadData(this.planId, this.trainingWeekIndex, this.trainingDayIndex);
  }

  /**
   * Navigates to the specified training week.
   * Reloads the training data for the new week.
   * @param direction - Direction to navigate (1 for next week, -1 for previous week).
   */
  navigateWeek(direction: number): void {
    this.trainingWeekIndex = this.navigationService.navigateWeek(
      this.trainingWeekIndex,
      direction,
      this.trainingPlanData,
      this.trainingDayIndex,
    );
    this.automationContextInitialized = false;
    this.loadData(this.planId, this.trainingWeekIndex, this.trainingDayIndex);
  }

  switchToTimerView() {
    this.modalService.open({
      component: RestTimerComponent,
      title: 'Pause Timer',
      buttonText: 'Abbrechen',
      hasFooter: false,
    });
  }

  openAutoProgressionModal() {
    this.modalService.open({
      component: AutoProgressionComponent,
      title: 'Automatische Progression',
      buttonText: 'Übernehmen',
      componentData: {
        planId: this.planId,
      },
    });
  }
}
