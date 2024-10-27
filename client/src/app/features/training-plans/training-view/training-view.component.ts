import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FormService } from '../../../core/services/form.service';
import { ModalService } from '../../../core/services/modal/modalService';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { HeadlineComponent } from '../../../shared/components/headline/headline.component';
import { IconButtonComponent } from '../../../shared/components/icon-button/icon-button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SkeletonTrainingTableComponent } from '../../../shared/components/loader/skeleton-training-table/skeleton-training-table.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { InteractiveElementDirective } from '../../../shared/directives/interactive-element.directive';
import { SwipeDirective } from '../../../shared/directives/swipe.directive';
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
    TooltipDirective,
    SpinnerComponent,
    SwipeDirective,
  ],
  providers: [TrainingViewService, TrainingPlanDataService, EstMaxService, ExerciseDataService],
  templateUrl: './training-view.component.html',
  styleUrls: ['./training-view.component.scss'],
})
export class TrainingViewComponent implements OnInit {
  protected readonly IconName = IconName;

  trainingWeekIndex: number = 0;
  trainingDayIndex: number = 0;

  protected planId!: string;

  viewInitialized = signal(false);

  constructor(
    private route: ActivatedRoute,
    private trainingViewService: TrainingViewService,
    private headerService: HeaderService,
    private formService: FormService,
    private navigationService: TrainingViewNavigationService,
    private modalService: ModalService,
    private autoSaveService: AutoSaveService,
    private destroyRef: DestroyRef,
    protected exerciseDataService: ExerciseDataService,
    protected trainingDataService: TrainingPlanDataService,
  ) {}

  /**
   * Initializes the component.
   * Subscribes to route parameters and loads the initial data.
   */
  ngOnInit() {
    this.headerService.setLoading();

    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.planId = params['planId'];
      this.trainingWeekIndex = parseInt(params['week']);
      this.trainingDayIndex = parseInt(params['day']);

      this.loadData(this.planId, this.trainingWeekIndex, this.trainingDayIndex);
    });

    this.initializeAutoSaveLogic();
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

          this.exerciseDataService.setExerciseData(exerciseData);

          this.setHeadlineInfo(trainingPlan);
          this.viewInitialized.set(true);
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

  private openAutoProgressionModal() {
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
          ],
        },
      ],
    });
  }

  private initializeAutoSaveLogic() {
    this.autoSaveService.inputChanged$
      .pipe(takeUntilDestroyed(this.destroyRef)) // Automatically unsubscribe
      .subscribe((option) => {
        this.saveTrainingData$().subscribe(() => {
          if (option === 'reload') {
            this.loadData(this.planId, this.trainingWeekIndex, this.trainingDayIndex);
          }
        });
      });
  }

  protected swipeLeft = () => this.navigateDay(this.trainingDayIndex + 1, this.trainingWeekIndex);
  protected swipeRight = () => this.navigateDay(this.trainingDayIndex - 1, this.trainingWeekIndex);
  protected swipeDiagonalTopLeftToBottomRight = () => this.navigateWeek(-1);
  protected swipeDiagonalTopRightToBottomLeft = () => this.navigateWeek(1);
}
