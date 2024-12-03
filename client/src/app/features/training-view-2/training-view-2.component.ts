import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { BasicInfoModalOptionsBuilder } from '../../core/services/modal/basic-info/basic-info-modal-options-builder';
import { ModalOptionsBuilder } from '../../core/services/modal/modal-options-builder';
import { ModalService } from '../../core/services/modal/modal.service';
import { MobileDeviceDetectionService } from '../../platform/mobile-device-detection.service';
import { DropdownComponent } from '../../shared/components/dropdown/dropdown.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { MoreOptionListItem } from '../../shared/components/more-options-button/more-option-list-item';
import { NavigationArrowsComponent } from '../../shared/components/navigation-arrows/navigation-arrows.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { IconName } from '../../shared/icon/icon-name';
import { HeaderService } from '../header/header.service';
import { ExerciseCategories } from '../training-plans/model/exercise-categories';
import { AutoProgressionComponent } from '../training-plans/training-view/auto-progression/auto-progression.component';
import { AutoProgressionService } from '../training-plans/training-view/auto-progression/auto-progression.service';
import { ExerciseDataService } from '../training-plans/training-view/exercise-data.service';
import { TrainingDayLocatorService } from '../training-plans/training-view/services/training-day-locator.service';
import { TrainingPlanDataService } from '../training-plans/training-view/services/training-plan-data.service';
import { Exercise } from '../training-plans/training-view/training-exercise';
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
    NavigationArrowsComponent,
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingView2Component implements OnInit, AfterViewInit, OnDestroy {
  trainingGrid = viewChild<ElementRef>('trainingGrid');

  exercises = signal<Exercise[]>([]);

  /**
   * Controls the visibility of the "Add Row" button.
   */
  showAddRowButton = signal(false);

  /**
   * Flag to allow removal of defined rows.
   */
  allowRemovalOfDefinedRows = signal(false);

  planId = signal('');
  trainingWeekIndex = signal(0);
  trainingDayIndex = signal(0);

  viewInitialized = signal(false);

  /**
   * Listener for global mouse move events.
   */
  private mouseMoveListener!: (event: MouseEvent) => void;

  constructor(
    private modalService: ModalService,
    private trainingViewService: TrainingViewService,
    private exerciseDataService: ExerciseDataService,
    protected mobileDeviceDetectionService: MobileDeviceDetectionService,
    private trainingPlanDataService: TrainingPlanDataService,
    private autoProgressionService: AutoProgressionService,
    private headerService: HeaderService,
    private route: ActivatedRoute,
    private destroyRef: DestroyRef,
  ) {}

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
    });

    this.loadData(this.planId(), this.trainingWeekIndex(), this.trainingDayIndex());
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

  /**
   * Registers a global mouse move listener after the view is initialized.
   */
  ngAfterViewInit(): void {
    this.mouseMoveListener = this.checkMousePosition.bind(this);
    document.addEventListener('mousemove', this.mouseMoveListener);
  }

  /**
   * Removes the global mouse move listener when the component is destroyed.
   */
  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.mouseMoveListener);
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

  // TODO: has to be reworked completely
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
    if (this.modalService.isVisible()) return;

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

  /**
   * Checks the mouse position to toggle the visibility of the "Add Row" button.
   */
  private checkMousePosition(event: MouseEvent): void {
    const gridElement = this.trainingGrid()?.nativeElement;
    if (!gridElement) return;

    const gridRect = gridElement.getBoundingClientRect();
    const mouseY = event.clientY;

    const isBelowGrid = mouseY > gridRect.bottom && mouseY <= gridRect.bottom + 55;
    const isOverLastExercise = mouseY <= gridRect.bottom && mouseY >= gridRect.bottom - 37;

    this.showAddRowButton.set(isBelowGrid || isOverLastExercise);
  }
}
