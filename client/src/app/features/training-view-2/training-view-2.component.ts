import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, OnInit, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { BasicInfoModalOptionsBuilder } from '../../core/services/modal/basic-info/basic-info-modal-options-builder';
import { ModalOptionsBuilder } from '../../core/services/modal/modal-options-builder';
import { ModalService } from '../../core/services/modal/modal.service';
import { DropdownComponent } from '../../shared/components/dropdown/dropdown.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { MoreOptionListItem } from '../../shared/components/more-options-button/more-option-list-item';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { IconName } from '../../shared/icon/icon-name';
import { HeaderService } from '../header/header.service';
import { ExerciseCategories } from '../training-plans/model/exercise-categories';
import { AutoProgressionComponent } from '../training-plans/training-view/auto-progression/auto-progression.component';
import { AutoProgressionService } from '../training-plans/training-view/auto-progression/auto-progression.service';
import { ExerciseDataService } from '../training-plans/training-view/exercise-data.service';
import { NavigationDirection } from '../training-plans/training-view/models/navigation-direction.enum';
import { TrainingDayLocatorService } from '../training-plans/training-view/services/training-day-locator.service';
import { TrainingPlanDataService } from '../training-plans/training-view/services/training-plan-data.service';
import { Exercise } from '../training-plans/training-view/training-exercise';
import { TrainingViewNavigationService } from '../training-plans/training-view/training-view-navigation.service';
import { TrainingViewNavigationComponent } from '../training-plans/training-view/training-view-navigation/training-view-navigation.component';
import { TrainingViewService } from '../training-plans/training-view/training-view-service';
import { AddRowButtonComponent } from './add-row-button/add-row-button.component';
import { TrainingViewTableRowComponent } from './training-view-table-row/training-view-table-row.component';

@Component({
  selector: 'app-training-view-2',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddRowButtonComponent,
    DropdownComponent,
    InputComponent,
    TrainingViewTableRowComponent,
    TrainingViewNavigationComponent,
    PaginationComponent,
    SpinnerComponent,
  ],
  templateUrl: './training-view-2.component.html',
  styleUrls: ['./training-view-2.component.scss'],
  providers: [
    TrainingViewService,
    ExerciseDataService,
    TrainingDayLocatorService,
    TrainingPlanDataService,
    AutoProgressionService,
    TrainingViewNavigationService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingView2Component implements OnInit {
  trainingGrid = viewChild<ElementRef>('trainingGrid');

  /**
   * Holds res the list of exercises for the current training day.
   */
  exercises = signal<Exercise[]>([]);

  /**
   * Flag to allow removal of defined rows.
   */
  allowRemovalOfDefinedRows = signal(false);

  /**
   * Stores the ID of the current training plan.
   */
  planId = signal('');

  /**
   * Index of the current training week.
   */
  trainingWeekIndex = signal(0);

  /**
   * Index of the current training day.
   */
  trainingDayIndex = signal(0);

  /**
   * Indicates whether the view has been fully initialized.
   */
  viewInitialized = signal(false);

  constructor(
    private modalService: ModalService,
    private trainingViewService: TrainingViewService,
    private exerciseDataService: ExerciseDataService,
    private trainingPlanDataService: TrainingPlanDataService,
    private autoProgressionService: AutoProgressionService,
    private navigationService: TrainingViewNavigationService,
    private headerService: HeaderService,
    private route: ActivatedRoute,
    private destroyRef: DestroyRef,
  ) {
    this.bindSwipeHandlers();
  }

  ngOnInit(): void {
    this.trainingViewService
      .loadExerciseData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((exerciseData) => {
        this.exerciseDataService.setExerciseData(exerciseData);
      });

    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.planId.set(params['planId']);
      this.trainingWeekIndex.set(Number(params['week']));
      this.trainingDayIndex.set(Number(params['day']));

      this.loadData(this.planId(), this.trainingWeekIndex(), this.trainingDayIndex());
    });
  }

  setHeadlineInfo(trainingPlanTitle: string) {
    this.headerService.setHeadlineInfo({
      title: trainingPlanTitle,
      subTitle: `W${this.trainingWeekIndex() + 1}D${this.trainingDayIndex() + 1}`,
      buttons: [
        {
          icon: IconName.MORE_VERTICAL,
          options: this.determineHeadlineOptions(),
        },
      ],
    });
  }

  protected navigateToNextDay(): void {
    this.navigationService.navigateToNextDay(this.trainingDayIndex(), this.trainingWeekIndex());
  }

  protected navigateToPreviousDay(): void {
    this.navigationService.navigateToPreviousDay(this.trainingDayIndex(), this.trainingWeekIndex());
  }

  protected navigateToPreviousWeek(): void {
    this.navigationService.navigateToWeek(
      NavigationDirection.BACKWARD,
      this.trainingWeekIndex(),
      this.trainingDayIndex(),
    );
  }

  protected navigateToNextWeek(): void {
    this.navigationService.navigateToWeek(
      NavigationDirection.FORWARD,
      this.trainingWeekIndex(),
      this.trainingDayIndex(),
    );
  }

  /**
   * Adds a new row to the exercise grid.
   */
  protected addRow(): void {
    const newEntry: Exercise = {
      category: ExerciseCategories.PLACEHOLDER,
      exercise: '',
      sets: 0,
      reps: 0,
      weight: undefined,
      targetRPE: 0,
      actualRPE: undefined,
      estMax: 0,
      notes: '',
    };

    this.exercises.update((entries) => [...entries, newEntry]);
  }

  /**
   * Removes the last row from the exercise grid, with confirmation if the row is not empty.
   */
  protected removeRow(): void {
    const lastEntry = this.getLastExerciseEntry();

    if (!lastEntry) return;

    if (this.isEntryEmpty(lastEntry) || this.allowRemovalOfDefinedRows()) {
      this.exercises.update((entries) => entries.slice(0, -1));
    } else {
      this.showDeletionModal();
    }
  }

  private loadData(planId: string, week: number, day: number): void {
    forkJoin({
      trainingPlanDto: this.trainingViewService.loadTrainingPlan(planId, week, day),
      exerciseDataDto: this.trainingViewService.loadExerciseData(),
    })
      .pipe(
        tap(({ trainingPlanDto, exerciseDataDto }) => {
          this.trainingPlanDataService.initializeFromDto(trainingPlanDto);
          this.exercises.set(trainingPlanDto.trainingDay.exercises);

          this.exerciseDataService.setExerciseData(exerciseDataDto);

          this.setHeadlineInfo(trainingPlanDto.title);
          this.viewInitialized.set(true);
        }),
      )
      .subscribe();
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

    if (this.trainingPlanDataService.trainingDay()?.exercises.length) {
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
        async () => await firstValueFrom(this.autoProgressionService.confirmAutoProgression(this.planId())),
      )
      .build();

    this.modalService.open(modalOptions);
  }

  private openTrainingExerciseList(): void {
    const providerMap = new Map().set(TrainingPlanDataService, this.trainingPlanDataService);

    const modalOptions = new ModalOptionsBuilder()
      .setTitle('Übungen anordnen')
      .setProviderMap(providerMap)
      .setOnSubmitCallback(async () => {
        console.log('to be implemented');
      })
      .build();

    this.modalService.open(modalOptions);
  }

  /**
   * Returns the last entry in the exercise grid.
   */
  private getLastExerciseEntry(): Exercise | undefined {
    return this.exercises().length > 0 ? this.exercises()[this.exercises().length - 1] : undefined;
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
