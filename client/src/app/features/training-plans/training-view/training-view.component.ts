import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SkeletonTrainingTableComponent } from '../../../components/loaders/skeletons/skeleton-training-table/skeleton-training-table.component';
import { BrowserCheckService } from '../../../core/browser-check.service';
import { FormService } from '../../../core/form.service';
import { ModalService } from '../../../core/services/modal/modalService';
import { SwipeService } from '../../../core/swipe.service';
import { MobileDeviceDetectionService } from '../../../platform/mobile-device-detection.service';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { HeadlineComponent } from '../../../shared/components/headline/headline.component';
import { HeadlineService } from '../../../shared/components/headline/headline.service';
import { IconButtonComponent } from '../../../shared/components/icon-button/icon-button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { InteractiveElementDirective } from '../../../shared/directives/interactive-element.directive';
import { IconName } from '../../../shared/icon/icon-name';
import { IconComponent } from '../../../shared/icon/icon.component';
import { AutoSaveService } from '../../../shared/service/auto-save.service';
import { ButtonClickService } from '../../../shared/service/button-click.service';
import { AutoProgressionComponent } from './auto-progression/auto-progression.component';
import { CategorySelectDirective } from './directives/category-select.directive';
import { RepInputDirective } from './directives/rep-input.directive';
import { RpeInputDirective } from './directives/rpe-input.directive';
import { WeightInputDirective } from './directives/weight-input.directive';
import { ExerciseDataService } from './exercise-data.service';
import { ExerciseDataDTO } from './exerciseDataDto';
import { RestTimerComponent } from './rest-timer/rest-timer.component';
import { EstMaxService } from './services/estmax.service';
import { FocusService } from './services/focus.service';
import { TrainingPlanDataService } from './services/training-plan-data.service';
import { TrainingViewNavigationService } from './training-view-navigation.service';
import { TrainingViewService } from './training-view-service';
import { TrainingPlanDto } from './trainingPlanDto';

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
    IconComponent,
    InputComponent,
    DropdownComponent,
    RepInputDirective,
  ],
  providers: [TrainingViewService, FocusService, TrainingPlanDataService, EstMaxService],
  templateUrl: './training-view.component.html',
  styleUrls: ['./training-view.component.scss'],
})
export class TrainingViewComponent implements OnInit, OnDestroy, AfterViewChecked {
  protected readonly IconName = IconName;

  title = '';
  trainingWeekIndex: number = 0;
  trainingDayIndex: number = 0;

  protected planId!: string;
  exerciseData: ExerciseDataDTO = new ExerciseDataDTO();
  trainingPlanData: TrainingPlanDto = new TrainingPlanDto();
  private dataViewLoaded = new BehaviorSubject<boolean>(false);
  dataViewLoaded$ = this.dataViewLoaded.asObservable();

  private automationContextInitialized = false;

  subHeading: string = '';

  @ViewChild('trainingTable', { static: false }) trainingTable!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private trainingViewService: TrainingViewService,
    private formService: FormService,
    private toastService: ToastService,
    private navigationService: TrainingViewNavigationService,
    private swipeService: SwipeService,
    private modalService: ModalService,
    private browserCheckService: BrowserCheckService,
    private autoSaveService: AutoSaveService,
    private exerciseDataService: ExerciseDataService,
    private focusService: FocusService,
    private destroyRef: DestroyRef,
    protected trainingDataService: TrainingPlanDataService,
    protected mobileDeviceDetectionService: MobileDeviceDetectionService,
    private headlineService: HeadlineService,
    private buttonClickService: ButtonClickService
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

      this.headlineService.subTitle.set(`W${this.trainingWeekIndex + 1}D${this.trainingDayIndex + 1}`);

      this.loadData(this.planId, this.trainingWeekIndex, this.trainingDayIndex);

      this.buttonClickService.buttonClick$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.switchToTimerView();
      });
    });

    this.autoSaveService.inputChanged$
      .pipe(takeUntilDestroyed(this.destroyRef)) // Automatically unsubscribe
      .subscribe(() => {
        this.saveTrainingData();
      });

    if (this.browserCheckService.isBrowser()) {
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }
  }

  ngOnDestroy() {
    if (this.browserCheckService.isBrowser()) {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }
  }

  /**
   * Lifecycle hook that is called after the component's view has been checked.
   * Initializes the swipe listener once the data view has loaded.
   */
  ngAfterViewChecked(): void {
    if (this.browserCheckService.isBrowser() && !this.automationContextInitialized) {
      if (this.dataViewLoaded.getValue() && this.trainingTable) {
        this.initializeSwipeListener();

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

  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: Event) {
    this.focusService.saveFocusedElement();
  }

  handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      this.focusService.saveFocusedElement();
    } else if (document.visibilityState === 'visible') {
      this.focusService.restoreFocusedElement();
      this.focusService.clearFocusedElement();
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
          this.trainingDataService.trainingPlanData = trainingPlan;

          this.exerciseData = exerciseData;
          this.exerciseDataService.exerciseData = exerciseData;

          if (trainingPlan.title) {
            this.title = trainingPlan.title;
            this.headlineService.title.set(trainingPlan.title);
            this.headlineService.isTitleLoading.set(false);
          }
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
          this.toastService.success('Daten konnten nicht gespeichtert werden');

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
      const confirmed = await this.modalService.openBasicInfoModal({
        title: 'Ungespeicherte Änderungen',
        buttonText: 'Änderungen verwerfen',
        infoText: 'Es gibt ungespeicherte Änderungen. Möchtest du wirklich fortfahren und die Änderungen verwerfen?',
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
