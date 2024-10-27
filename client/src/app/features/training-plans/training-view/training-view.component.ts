import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, OnInit, signal } from '@angular/core';
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
import { NavigationDirection } from './models/navigation-direction.enum';
import { EstMaxService } from './services/estmax.service';
import { TrainingDayLocatorService } from './services/training-day-locator.service';
import { TrainingPlanDataService } from './services/training-plan-data.service';
import { TrainingViewNavigationService } from './training-view-navigation.service';
import { TrainingViewService } from './training-view-service';

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
  providers: [
    TrainingViewService,
    TrainingViewNavigationService,
    TrainingPlanDataService,
    EstMaxService,
    ExerciseDataService,
    TrainingDayLocatorService,
  ],
  templateUrl: './training-view.component.html',
  styleUrls: ['./training-view.component.scss'],
})
export class TrainingViewComponent implements OnInit {
  protected readonly IconName = IconName;
  protected readonly NavigationDirection = NavigationDirection;

  viewInitialized = signal(false);

  planId = computed(() => this.trainingDayLocatorService.planId);
  trainingWeekIndex = computed(() => this.trainingDayLocatorService.trainingWeekIndex);
  trainingDayIndex = computed(() => this.trainingDayLocatorService.trainingDayIndex);

  constructor(
    private route: ActivatedRoute,
    private trainingViewService: TrainingViewService,
    private trainingDayLocatorService: TrainingDayLocatorService,
    private headerService: HeaderService,
    private formService: FormService,
    private modalService: ModalService,
    private autoSaveService: AutoSaveService,
    private destroyRef: DestroyRef,
    protected navigationService: TrainingViewNavigationService,
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
      this.trainingDayLocatorService.planId = params['planId'];
      this.trainingDayLocatorService.trainingWeekIndex = Number(params['week']);
      this.trainingDayLocatorService.trainingDayIndex = Number(params['day']);

      this.loadData(
        this.trainingDayLocatorService.planId,
        this.trainingDayLocatorService.trainingWeekIndex,
        this.trainingDayLocatorService.trainingDayIndex,
      );
    });

    this.initializeAutoSaveLogic();
  }

  protected swipeLeft = () => this.navigationService.navigateDay(this.trainingDayIndex() + 1);
  protected swipeRight = () => this.navigationService.navigateDay(this.trainingDayIndex() - 1);
  protected swipeDiagonalTopLeftToBottomRight = () =>
    this.navigationService.navigateWeek(NavigationDirection.BACKWARD, this.trainingDayIndex());
  protected swipeDiagonalTopRightToBottomLeft = () =>
    this.navigationService.navigateWeek(NavigationDirection.FORWARD, this.trainingDayIndex());

  /**
   * Loads training data and exercise data for the specified plan, week, and day.
   * Updates the component state with the loaded data.
   */
  private loadData(planId: string, week: number, day: number): void {
    forkJoin({
      trainingPlanDto: this.trainingViewService.loadTrainingPlan(planId, week, day),
      exerciseDataDto: this.trainingViewService.loadExerciseData(),
    })
      .pipe(
        tap(({ trainingPlanDto, exerciseDataDto }) => {
          this.trainingDataService.initializeFromDto(trainingPlanDto);

          this.exerciseDataService.setExerciseData(exerciseDataDto);

          this.setHeadlineInfo(trainingPlanDto.title);
          this.viewInitialized.set(true);
        }),
      )
      .subscribe();
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

  private setHeadlineInfo(trainingPlanTitle: string) {
    this.headerService.setHeadlineInfo({
      title: trainingPlanTitle,
      subTitle: this.getSubtitle(),
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
      .subscribe(() => {
        this.saveTrainingData$().subscribe(() => {});
      });
  }

  /**
   * Handles form submission.
   * Prevents default form submission, collects changed data, and submits the training plan.
   */
  private saveTrainingData$(): Observable<void> {
    return this.trainingViewService
      .submitTrainingPlan(
        this.planId(),
        this.trainingWeekIndex(),
        this.trainingDayIndex(),
        this.formService.getChanges(),
      )
      .pipe(
        tap(() => {
          this.formService.clearChanges();
        }),
      );
  }

  private getSubtitle(): string {
    return `W${this.trainingWeekIndex() + 1}D${this.trainingDayIndex() + 1}`;
  }
}
