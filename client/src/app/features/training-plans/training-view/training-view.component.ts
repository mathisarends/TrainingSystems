import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, forkJoin, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FormService } from '../../../core/services/form.service';
import { ModalOptionsBuilder } from '../../../core/services/modal/modal-options-builder';
import { ModalService } from '../../../core/services/modal/modal.service';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { MoreOptionListItem } from '../../../shared/components/more-options-button/more-option-list-item';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { SwipeDirective } from '../../../shared/directives/swipe.directive';
import { IconName } from '../../../shared/icon/icon-name';
import { AutoSaveService } from '../../../shared/service/auto-save.service';
import {
  UserBestPerformanceService,
} from '../../../shared/service/user-best-performance/user-best-performance.service';
import { HeaderService } from '../../header/header.service';
import { SetHeadlineInfo } from '../../header/set-headline-info';
import { AutoProgressionComponent } from './auto-progression/auto-progression.component';
import { AutoProgressionService } from './auto-progression/auto-progression.service';
import { WeightInputDirective } from './directives/weight-input.directive';
import { ExerciseDataService } from './exercise-data.service';
import { NavigationDirection } from './models/navigation-direction.enum';
import { EstMaxService } from './services/estmax.service';
import { TrainingDayLocatorService } from './services/training-day-locator.service';
import { TrainingPlanDataService } from './services/training-plan-data.service';
import { TrainingExercisesListComponent } from './training-exercises-list/training-exercises-list.component';
import { TrainingViewNavigationService } from './training-view-navigation.service';
import { TrainingViewNavigationComponent } from './training-view-navigation/training-view-navigation.component';
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
    TrainingViewNavigationComponent,
    WeightInputDirective,
    InputComponent,
    DropdownComponent,
    SpinnerComponent,
    SwipeDirective,
    FormsModule,
  ],
  providers: [
    TrainingViewService,
    TrainingViewNavigationService,
    TrainingPlanDataService,
    EstMaxService,
    ExerciseDataService,
    TrainingDayLocatorService,
    UserBestPerformanceService,
    AutoProgressionService,
  ],
  templateUrl: './training-view.component.html',
  styleUrls: ['./training-view.component.scss'],
})
export class TrainingViewComponent implements OnInit, SetHeadlineInfo {
  protected readonly IconName = IconName;

  viewInitialized = signal(false);

  planId = computed(() => this.trainingDayLocatorService.planId());
  trainingWeekIndex = computed(() => this.trainingDayLocatorService.trainingWeekIndex());
  trainingDayIndex = computed(() => this.trainingDayLocatorService.trainingDayIndex());

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
    private autoProgressionService: AutoProgressionService,
  ) {
    this.bindSwipeHandlers();
  }

  /**
   * Initializes the component.
   * Subscribes to route parameters and loads the initial data.
   */
  ngOnInit() {
    this.headerService.setLoading();

    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.trainingDayLocatorService.planId.set(params['planId']);
      this.trainingDayLocatorService.trainingWeekIndex.set(Number(params['week']));
      this.trainingDayLocatorService.trainingDayIndex.set(Number(params['day']));

      this.loadData(
        this.trainingDayLocatorService.planId(),
        this.trainingDayLocatorService.trainingWeekIndex(),
        this.trainingDayLocatorService.trainingDayIndex(),
      );
    });

    this.initializeAutoSaveLogic();
  }

  setHeadlineInfo(trainingPlanTitle: string) {
    this.headerService.setHeadlineInfo({
      title: trainingPlanTitle,
      subTitle: this.getSubtitle(),
      buttons: [
        {
          icon: IconName.MORE_VERTICAL,
          options: this.determineHeadlineOptions(),
        },
      ],
    });
  }

  protected swipeLeft(): void {
    this.navigationService.navigateToNextDay(this.trainingDayIndex(), this.trainingWeekIndex());
  }

  protected swipeRight(): void {
    this.navigationService.navigateToPreviousDay(this.trainingDayIndex(), this.trainingWeekIndex());
  }

  protected swipeDiagonalTopLeftToBottomRight(): void {
    this.navigationService.navigateToWeek(
      NavigationDirection.BACKWARD,
      this.trainingWeekIndex(),
      this.trainingDayIndex(),
    );
  }

  protected swipeDiagonalTopRightToBottomLeft(): void {
    this.navigationService.navigateToWeek(
      NavigationDirection.FORWARD,
      this.trainingWeekIndex(),
      this.trainingDayIndex(),
    );
  }

  /**
   * Bindet Swipe-Handler-Methoden an das aktuelle `this`.
   */
  private bindSwipeHandlers(): void {
    this.swipeLeft = this.swipeLeft.bind(this);
    this.swipeRight = this.swipeRight.bind(this);
    this.swipeDiagonalTopLeftToBottomRight = this.swipeDiagonalTopLeftToBottomRight.bind(this);
    this.swipeDiagonalTopRightToBottomLeft = this.swipeDiagonalTopRightToBottomLeft.bind(this);
  }

  /**
   * Loads training data and exercise data for the specified plan, week, and day.
   * Updates the component state with the loaded data.
   */
  private loadData(planId: string, week: number, day: number): void {
    forkJoin({
      trainingPlanDto: this.trainingViewService.loadTrainingPlan(planId, week, day),
      exerciseDataDto: this.exerciseDataService.loadExerciseData(),
    })
      .pipe(
        tap(({ trainingPlanDto, exerciseDataDto }) => {
          this.trainingDataService.initializeFromDto(trainingPlanDto);
          this.setHeadlineInfo(trainingPlanDto.title);
          this.viewInitialized.set(true);
        }),
      )
      .subscribe();
  }

  private openAutoProgressionModal() {
    const providerMap = new Map().set(AutoProgressionService, this.autoProgressionService);

    const modalOptions = new ModalOptionsBuilder()
      .setComponent(AutoProgressionComponent)
      .setTitle('Automatische Progression')
      .setProviderMap(providerMap)
      .setOnSubmitCallback(async () => this.applyAutoProgression())
      .build();

    this.modalService.open(modalOptions);
  }

  private async applyAutoProgression(): Promise<void> {
    await firstValueFrom(this.autoProgressionService.confirmAutoProgression(this.planId()));
  }

  private openTrainingExerciseList(): void {
    const providerMap = new Map()
      .set(TrainingPlanDataService, this.trainingDataService)
      .set(FormService, this.formService)
      .set(TrainingDayLocatorService, this.trainingDayLocatorService);

    const modalOptions = new ModalOptionsBuilder()
      .setComponent(TrainingExercisesListComponent)
      .setTitle('Übungen anordnen')
      .setProviderMap(providerMap)
      .setOnSubmitCallback(async () => {
        await firstValueFrom(this.saveTrainingData$());
      })
      .build();

    this.modalService.open(modalOptions);
  }

  private determineHeadlineOptions(): MoreOptionListItem[] {
    const moreOptionsList: MoreOptionListItem[] = [];

    if (this.trainingWeekIndex() === 0) {
      moreOptionsList.push({
        label: 'Progression',
        icon: IconName.Activity,
        callback: this.openAutoProgressionModal.bind(this),
      });
    }

    if (this.trainingDataService.exercises().length) {
      moreOptionsList.push({
        label: 'Anordnen',
        icon: IconName.DRAG,
        callback: this.openTrainingExerciseList.bind(this),
      });
    }

    return moreOptionsList;
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
    const changes = this.formService.getChanges();

    return this.trainingViewService
      .submitTrainingPlan(this.planId(), this.trainingWeekIndex(), this.trainingDayIndex(), changes)
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
