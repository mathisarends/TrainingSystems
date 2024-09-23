import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, DestroyRef, ElementRef, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BrowserCheckService } from '../../../core/services/browser-check.service';
import { FormService } from '../../../core/services/form.service';
import { ModalService } from '../../../core/services/modal/modalService';
import { SwipeService } from '../../../core/services/swipe.service';
import { MobileDeviceDetectionService } from '../../../platform/mobile-device-detection.service';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { HeadlineComponent } from '../../../shared/components/headline/headline.component';
import { IconButtonComponent } from '../../../shared/components/icon-button/icon-button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SkeletonTrainingTableComponent } from '../../../shared/components/loader/skeleton-training-table/skeleton-training-table.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { InteractiveElementDirective } from '../../../shared/directives/interactive-element.directive';
import { IconName } from '../../../shared/icon/icon-name';
import { IconComponent } from '../../../shared/icon/icon.component';
import { AutoSaveService } from '../../../shared/service/auto-save.service';
import { ButtonClickService } from '../../../shared/service/button-click.service';
import { HeaderService } from '../../header/header.service';
import { AutoProgressionComponent } from './auto-progression/auto-progression.component';
import { RepInputDirective } from './directives/rep-input.directive';
import { RpeInputDirective } from './directives/rpe-input.directive';
import { WeightInputDirective } from './directives/weight-input.directive';
import { ExerciseDataService } from './exercise-data.service';
import { ExerciseDataDTO } from './exerciseDataDto';
import { RestTimerComponent } from './rest-timer/rest-timer.component';
import { EstMaxService } from './services/estmax.service';
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
    InteractiveElementDirective,
    IconComponent,
    InputComponent,
    DropdownComponent,
    RepInputDirective,
  ],
  providers: [TrainingViewService, TrainingPlanDataService, EstMaxService, SwipeService],
  templateUrl: './training-view.component.html',
  styleUrls: ['./training-view.component.scss'],
})
export class TrainingViewComponent implements OnInit, /* OnDestroy, */ AfterViewChecked {
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
    private headerService: HeaderService,
    private formService: FormService,
    private navigationService: TrainingViewNavigationService,
    private swipeService: SwipeService,
    private modalService: ModalService,
    private browserCheckService: BrowserCheckService,
    private autoSaveService: AutoSaveService,
    private exerciseDataService: ExerciseDataService,
    private destroyRef: DestroyRef,
    protected trainingDataService: TrainingPlanDataService,
    protected mobileDeviceDetectionService: MobileDeviceDetectionService,
    private buttonClickService: ButtonClickService,
  ) {}

  /**
   * Initializes the component.
   * Subscribes to route parameters and loads the initial data.
   */
  ngOnInit() {
    this.headerService.setLoading();

    this.route.queryParams.subscribe((params) => {
      this.planId = params['planId'];
      this.trainingWeekIndex = parseInt(params['week']);
      this.trainingDayIndex = parseInt(params['day']);

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
        () => this.navigateDay(this.trainingDayIndex + 1),
        () => this.navigateDay(this.trainingDayIndex - 1),
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
          this.trainingDataService.trainingPlanData = trainingPlan;

          this.exerciseData = exerciseData;
          this.exerciseDataService.exerciseData = exerciseData;

          this.subHeading = `W${this.trainingWeekIndex + 1}D${this.trainingDayIndex + 1}`;

          if (trainingPlan.title) {
            this.headerService.setHeadlineInfo({
              title: trainingPlan.title,
              subTitle: this.subHeading,
              buttons: [{ icon: IconName.CLOCK, callback: this.switchToTimerView.bind(this) }],
            });

            this.title = trainingPlan.title;
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
  saveTrainingData(): void {
    const changedData = this.formService.getChanges();

    this.trainingViewService
      .submitTrainingPlan(this.planId, this.trainingWeekIndex, this.trainingDayIndex, changedData)
      .pipe(
        tap(() => {
          this.formService.clearChanges();
        }),
      )
      .subscribe();
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
