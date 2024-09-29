import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
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
import { TooltipDirective } from '../../../shared/directives/tooltip.directive';
import { IconName } from '../../../shared/icon/icon-name';
import { IconComponent } from '../../../shared/icon/icon.component';
import { AutoSaveService } from '../../../shared/service/auto-save.service';
import { HeaderService } from '../../header/header.service';
import { FormatTimePipe } from '../format-time.pipe';
import { AutoProgressionComponent } from './auto-progression/auto-progression.component';
import { RepInputDirective } from './directives/rep-input.directive';
import { RpeInputDirective } from './directives/rpe-input.directive';
import { WeightInputDirective } from './directives/weight-input.directive';
import { ExerciseDataService } from './exercise-data.service';
import { ExerciseDataDTO } from './exerciseDataDto';
import { RestTimerComponent } from './rest-timer/rest-timer.component';
import { EstMaxService } from './services/estmax.service';
import { PauseTimeService } from './services/pause-time.service';
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
    FormatTimePipe,
    DragDropModule,
    TooltipDirective,
  ],
  providers: [TrainingViewService, TrainingPlanDataService, EstMaxService, SwipeService],
  templateUrl: './training-view.component.html',
  styleUrls: ['./training-view.component.scss'],
})
export class TrainingViewComponent implements OnInit {
  protected readonly IconName = IconName;

  trainingWeekIndex: number = 0;
  trainingDayIndex: number = 0;

  protected planId!: string;
  exerciseData: ExerciseDataDTO = new ExerciseDataDTO();
  private dataViewLoaded = new BehaviorSubject<boolean>(false);
  dataViewLoaded$ = this.dataViewLoaded.asObservable();

  private automationContextInitialized = false;

  @ViewChild('trainingTable', { static: false }) trainingTable!: ElementRef;

  isDragMode = signal(false);

  constructor(
    private route: ActivatedRoute,
    private trainingViewService: TrainingViewService,
    private headerService: HeaderService,
    private formService: FormService,
    private navigationService: TrainingViewNavigationService,
    private swipeService: SwipeService,
    private modalService: ModalService,
    private autoSaveService: AutoSaveService,
    private exerciseDataService: ExerciseDataService,
    private destroyRef: DestroyRef,
    protected trainingDataService: TrainingPlanDataService,
    protected mobileDeviceDetectionService: MobileDeviceDetectionService,
    protected pauseTimeService: PauseTimeService,
  ) {}

  /**
   * Initializes the component.
   * Subscribes to route parameters and loads the initial data.
   */
  ngOnInit() {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.automationContextInitialized = false;
      this.swipeService.removeSwipeListener();
      this.headerService.setLoading();
      this.planId = params['planId'];
      this.trainingWeekIndex = parseInt(params['week']);
      this.trainingDayIndex = parseInt(params['day']);

      this.loadData(this.planId, this.trainingWeekIndex, this.trainingDayIndex);
    });

    this.autoSaveService.inputChanged$
      .pipe(takeUntilDestroyed(this.destroyRef)) // Automatically unsubscribe
      .subscribe((option) => {
        this.saveTrainingData$().subscribe(() => {
          if (option === 'reload') {
            this.dataViewLoaded.next(false);
            this.loadData(this.planId, this.trainingWeekIndex, this.trainingDayIndex);
          }
        });
      });
  }

  ngAfterViewChecked(): void {
    if (this.dataViewLoaded.getValue() && this.trainingTable && !this.automationContextInitialized) {
      this.initializeSwipeListener();
      this.automationContextInitialized = true;
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
        () => this.navigateDay(this.trainingDayIndex + 1, this.trainingWeekIndex),
        () => this.navigateDay(this.trainingDayIndex - 1, this.trainingWeekIndex),
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
   * Loads training data and exercise data for the specified plan, week, and day.
   * Updates the component state with the loaded data.
   * @param planId - ID of the training plan.
   * @param week - Index of the training week.
   * @param day - Index of the training day.
   */
  loadData(planId: string, week: number, day: number): void {
    forkJoin({
      trainingPlan: this.trainingViewService.loadTrainingPlan(planId, week, day),
      exerciseData: this.trainingViewService.loadExerciseData(),
    })
      .pipe(
        tap(({ trainingPlan, exerciseData }) => {
          this.trainingDataService.trainingPlanData = trainingPlan;
          console.log(
            '🚀 ~ TrainingViewComponent ~ tap ~ this.trainingDataService.trainingPlanData:',
            this.trainingDataService.trainingPlanData,
          );

          this.exerciseData = exerciseData;
          this.exerciseDataService.exerciseData = exerciseData;

          this.setHeadlineInfo(trainingPlan);
        }),
        tap(() => {
          if (this.trainingDataService.trainingPlanData && this.exerciseData) {
            this.dataViewLoaded.next(true);
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
  saveTrainingData$(): Observable<void> {
    return this.trainingViewService
      .submitTrainingPlan(this.planId, this.trainingWeekIndex, this.trainingDayIndex, this.formService.getChanges())
      .pipe(
        tap(() => {
          this.formService.clearChanges();
        }),
      );
  }

  navigateDay(day: number, weekIndex: number) {
    if (day === this.trainingDataService.trainingPlanData.trainingFrequency) {
      const isLastWeek = weekIndex === this.trainingDataService.trainingPlanData.trainingBlockLength - 1;

      if (!isLastWeek) {
        weekIndex = weekIndex + 1;
      } else {
        weekIndex = 0;
      }
      day = 0;
    } else if (day < 0) {
      day = this.trainingDataService.trainingPlanData.trainingBlockLength - 1;
    }

    this.navigationService.navigateDay(day, this.trainingDataService.trainingPlanData.trainingFrequency, weekIndex);
  }

  /**
   * Navigates to the specified training week.
   * Reloads the training data for the new week.
   * @param direction - Direction to navigate (1 for next week, -1 for previous week).
   */
  navigateWeek(direction: number): void {
    this.navigationService.navigateWeek(
      this.trainingWeekIndex,
      direction,
      this.trainingDataService.trainingPlanData,
      this.trainingDayIndex,
    );
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

  private setHeadlineInfo(trainingPlan: TrainingPlanDto) {
    this.headerService.setHeadlineInfo({
      title: trainingPlan.title,
      subTitle: `W${this.trainingWeekIndex + 1}D${this.trainingDayIndex + 1}`,
      buttons: [
        {
          icon: IconName.MORE_VERTICAL,
          options: [
            {
              label: 'Progression',
              icon: IconName.Activity,
              callback: this.openAutoProgressionModal.bind(this),
            },
            {
              label: 'Anordnen',
              icon: IconName.DRAG,
              callback: () => this.toggleIsDragMode(),
            },
          ],
        },
      ],
    });
  }

  private toggleIsDragMode() {
    this.isDragMode.set(!this.isDragMode());
  }

  drop(event: CdkDragDrop<any, any, any>) {
    // Move the row in the exercises array to its new position
    moveItemInArray(
      this.trainingDataService.trainingPlanData.trainingDay.exercises!,
      event.previousIndex,
      event.currentIndex,
    );

    // Track the changes for both the previous and current exercises
    this.trackExerciseChanges(event.previousIndex);
    this.trackExerciseChanges(event.currentIndex);

    // Save the tracked changes
    this.saveTrainingData$().subscribe();
  }

  /**
   * Tracks changes for the exercise at the given index.
   * @param index - The index of the exercise in the array.
   */
  trackExerciseChanges(index: number) {
    const exercise = this.trainingDataService.trainingPlanData.trainingDay.exercises![index];
    const namePrefix = `day${this.trainingDayIndex}_exercise${index + 1}_`;

    const fields = ['category', 'exercise_name', 'sets', 'reps', 'weight', 'targetRPE', 'actualRPE', 'estMax', 'notes'];

    fields.forEach((field) => {
      this.formService.addChange(namePrefix + field, (exercise as any)[field]);
    });
  }
}
