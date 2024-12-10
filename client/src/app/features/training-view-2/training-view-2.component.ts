import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { BasicInfoModalOptionsBuilder } from '../../core/services/modal/basic-info/basic-info-modal-options-builder';
import { ModalOptionsBuilder } from '../../core/services/modal/modal-options-builder';
import { ModalService } from '../../core/services/modal/modal.service';
import { MoreOptionListItem } from '../../shared/components/more-options-button/more-option-list-item';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { IconName } from '../../shared/icon/icon-name';
import { HeaderService } from '../header/header.service';
import { ExerciseCategories } from '../training-plans/model/exercise-categories';
import { AutoProgressionComponent } from '../training-plans/training-view/auto-progression/auto-progression.component';
import { AutoProgressionService } from '../training-plans/training-view/auto-progression/auto-progression.service';
import { ExerciseDataService } from '../training-plans/training-view/exercise-data.service';
import { NavigationDirection } from '../training-plans/training-view/models/navigation-direction.enum';
import { TrainingPlanDataService } from '../training-plans/training-view/services/training-plan-data.service';
import { Exercise } from '../training-plans/training-view/training-exercise';
import { TrainingViewNavigationService } from '../training-plans/training-view/training-view-navigation.service';
import { TrainingViewNavigationComponent } from '../training-plans/training-view/training-view-navigation/training-view-navigation.component';
import { TrainingViewService } from '../training-plans/training-view/training-view-service';
import { AddRowButtonComponent } from './add-row-button/add-row-button.component';
import { TrainingViewTableRowComponent } from './training-view-table-row/training-view-table-row.component';
import { SwipeDirective } from '../../shared/directives/swipe.directive';
import { TrainingDayLocatorService2 } from './training-day-locator.service';
import { TrainingExercisesListComponent } from '../training-plans/training-view/training-exercises-list/training-exercises-list.component';

@Component({
  selector: 'app-training-view-2',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddRowButtonComponent,
    TrainingViewTableRowComponent,
    TrainingViewNavigationComponent,
    SpinnerComponent,
    SwipeDirective,
  ],
  templateUrl: './training-view-2.component.html',
  styleUrls: ['./training-view-2.component.scss'],
  providers: [TrainingViewService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingView2Component implements OnInit {
  /**
   * Flag to allow removal of defined rows.
   */
  allowRemovalOfDefinedRows = signal(false);

  /**
   * Indicates whether the view has been fully initialized.
   */
  viewInitialized = signal(false);

  constructor(
    private modalService: ModalService,
    private trainingViewService: TrainingViewService,
    protected trainingDayLocatorService: TrainingDayLocatorService2,
    private exerciseDataService: ExerciseDataService,
    protected trainingPlanDataService: TrainingPlanDataService,
    private autoProgressionService: AutoProgressionService,
    private navigationService: TrainingViewNavigationService,
    private headerService: HeaderService,
    private route: ActivatedRoute,
    private destroyRef: DestroyRef,
  ) {
    this.bindSwipeHandlers();
  }

  ngOnInit(): void {
    this.exerciseDataService.loadExerciseData().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.headerService.setLoading();

    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const planId = params['planId'];
      const weekIndex = Number(params['week']);
      const dayIndex = Number(params['day']);

      this.trainingDayLocatorService.initializeTrainingDayInformation(planId, weekIndex, dayIndex);

      this.loadData(planId, weekIndex, dayIndex);
    });
  }

  setHeadlineInfo(trainingPlanTitle: string) {
    const trainingWeekIndex = this.trainingDayLocatorService.trainingWeekIndex();
    const trainingDayIndex = this.trainingDayLocatorService.trainingDayIndex();

    this.headerService.setHeadlineInfo({
      title: trainingPlanTitle,
      subTitle: `W${trainingWeekIndex + 1}D${trainingDayIndex + 1}`,
      buttons: [
        {
          icon: IconName.MORE_VERTICAL,
          options: this.determineHeadlineOptions(),
        },
      ],
    });
  }

  protected navigateToNextDay(): void {
    this.navigationService.navigateToNextDay(
      this.trainingDayLocatorService.trainingDayIndex(),
      this.trainingDayLocatorService.trainingWeekIndex(),
    );
  }

  protected navigateToPreviousDay(): void {
    this.navigationService.navigateToPreviousDay(
      this.trainingDayLocatorService.trainingDayIndex(),
      this.trainingDayLocatorService.trainingWeekIndex(),
    );
  }

  protected navigateToPreviousWeek(): void {
    const trainingWeekIndex = this.trainingDayLocatorService.trainingWeekIndex();
    const trainingDayIndex = this.trainingDayLocatorService.trainingDayIndex();

    this.navigationService.navigateToWeek(NavigationDirection.BACKWARD, trainingWeekIndex, trainingDayIndex);
  }

  protected navigateToNextWeek(): void {
    const trainingWeekIndex = this.trainingDayLocatorService.trainingWeekIndex();
    const trainingDayIndex = this.trainingDayLocatorService.trainingDayIndex();

    this.navigationService.navigateToWeek(NavigationDirection.FORWARD, trainingWeekIndex, trainingDayIndex);
  }

  /**
   * Removes the last row from the exercise grid, with confirmation if the row is not empty.
   */
  protected removeRow(): void {
    const lastEntry = this.getLastExerciseEntry();

    if (!lastEntry) return;

    if (this.isEntryEmpty(lastEntry) || this.allowRemovalOfDefinedRows()) {
      this.trainingPlanDataService.removeLastExercise();
    } else {
      this.showDeletionModal();
    }
  }

  private loadData(planId: string, week: number, day: number): void {
    forkJoin({
      trainingPlanDto: this.trainingViewService.loadTrainingPlan(planId, week, day),
      exerciseDataDto: this.exerciseDataService.loadExerciseData(),
    })
      .pipe(
        tap(({ trainingPlanDto, exerciseDataDto }) => {
          this.trainingPlanDataService.initializeFromDto(trainingPlanDto);

          this.setHeadlineInfo(trainingPlanDto.title);
          this.viewInitialized.set(true);
        }),
      )
      .subscribe();
  }

  private determineHeadlineOptions(): MoreOptionListItem[] {
    const moreOptionsList: MoreOptionListItem[] = [];

    if (this.trainingDayLocatorService.trainingWeekIndex() === 0) {
      moreOptionsList.push({
        label: 'Progression',
        icon: IconName.Activity,
        callback: this.openAutoProgressionModal.bind(this),
      });
    }

    if (this.trainingPlanDataService.exercises().length) {
      moreOptionsList.push({
        label: 'Anordnen',
        icon: IconName.DRAG,
        callback: this.openTrainingExerciseList.bind(this),
      });
    }

    return moreOptionsList;
  }

  private openAutoProgressionModal() {
    const providerMap = new Map().set(AutoProgressionService, this.autoProgressionService);

    const modalOptions = new ModalOptionsBuilder()
      .setComponent(AutoProgressionComponent)
      .setTitle('Automatische Progression')
      .setProviderMap(providerMap)
      .setOnSubmitCallback(
        async () =>
          await firstValueFrom(
            this.autoProgressionService.confirmAutoProgression(this.trainingDayLocatorService.trainingPlanId()),
          ),
      )
      .build();

    this.modalService.open(modalOptions);
  }

  private openTrainingExerciseList(): void {
    const providerMap = new Map().set(TrainingPlanDataService, this.trainingPlanDataService);
    const previousExercises = structuredClone(this.trainingPlanDataService.exercises());

    const modalOptions = new ModalOptionsBuilder()
      .setTitle('Übungen anordnen')
      .setProviderMap(providerMap)
      .setComponent(TrainingExercisesListComponent)
      .setOnAbortCallback(() => this.trainingPlanDataService.exercises.set(previousExercises))
      .setOnSubmitCallback(async () => {
        const planId = this.trainingDayLocatorService.trainingPlanId();
        const weekIndex = this.trainingDayLocatorService.trainingWeekIndex();
        const dayIndex = this.trainingDayLocatorService.trainingDayIndex();

        await firstValueFrom(
          this.trainingViewService.rearrangeExerciseOrder(
            planId,
            weekIndex,
            dayIndex,
            this.trainingPlanDataService.exercises(),
          ),
        );
      })
      .build();

    this.modalService.open(modalOptions);
  }

  /**
   * Returns the last entry in the exercise grid.
   */
  private getLastExerciseEntry(): Exercise | undefined {
    const exercises = this.trainingPlanDataService.exercises();
    return exercises.length > 0 ? exercises[exercises.length - 1] : undefined;
  }

  /**
   * Checks if an entry is empty by verifying its fields.
   */
  private isEntryEmpty(entry: Partial<Exercise>): boolean {
    return entry.category === ExerciseCategories.PLACEHOLDER;
  }

  /**
   * Displays a modal to confirm the removal of a row.
   */
  private showDeletionModal(): void {
    if (this.modalService.isVisible()) {
      return;
    }

    const modalOptions = new BasicInfoModalOptionsBuilder()
      .setTitle('Warnung')
      .setButtonText('Verstanden')
      .setInfoText(
        'Du bist dabei eine Übung zu löschen. Bestätige den Vorgang, wenn dies gewollt ist, falls nicht, schließe dieses Modal.',
      )
      .setIsDestructiveAction(true)
      .setOnSubmitCallback(async () => this.allowRemovalOfDefinedRows.set(true))
      .build();

    this.modalService.openBasicInfoModal(modalOptions);
  }

  private bindSwipeHandlers(): void {
    this.navigateToNextDay = this.navigateToNextDay.bind(this);
    this.navigateToPreviousDay = this.navigateToPreviousDay.bind(this);
    this.navigateToPreviousWeek = this.navigateToPreviousWeek.bind(this);
    this.navigateToNextWeek = this.navigateToNextWeek.bind(this);
  }
}
