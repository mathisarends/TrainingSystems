import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { FormService } from '../../../../core/services/form.service';
import {
  BasicInfoModalOptionsBuilder
} from '../../../../core/services/modal/basic-info/basic-info-modal-options-builder';
import { ModalService } from '../../../../core/services/modal/modal.service';
import { DropdownComponent } from '../../../../shared/components/dropdown/dropdown.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { MoreOptionListItem } from '../../../../shared/components/more-options-button/more-option-list-item';
import { IconName } from '../../../../shared/icon/icon-name';
import { AutoSaveService } from '../../../../shared/service/auto-save.service';
import { HeaderService } from '../../../header/header.service';
import { SetHeadlineInfo } from '../../../header/set-headline-info';
import { ExerciseDataDTO } from '../../../training-plans/training-view/exerciseDataDto';
import { ExerciseService } from '../../service/exercise.service.';
import { ExerciseTableSkeletonComponent } from '../exercise-table-skeleton/exercise-table-skeleton.component';

/**
 * Component responsible for displaying and managing exercises in the training view.
 * Provides functionality for configuring exercises, managing sets, reps, RPE, and pause times.
 */
@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [CommonModule, ExerciseTableSkeletonComponent, InputComponent, DropdownComponent],
  providers: [ExerciseService],
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.scss'],
})
export class ExercisesComponent implements OnInit, SetHeadlineInfo {
  /**
   * Observable that emits the exercise data or `null` if there's an error or the data is still loading.
   */
  exerciseData$!: Observable<ExerciseDataDTO>;

  /**
   * Maximum number of exercises that can be displayed.
   */
  maxExercises = 8;

  /**
   * Signal containing the available pause time options in seconds.
   */
  pauseTimeOptions = signal([60, 90, 120, 150, 180, 210, 240, 270, 300]);

  /**
   * Signal containing the labels for pause time options.
   */
  pauseTimeLabels = signal([
    '1 Minute',
    '1.5 Minuten',
    '2 Minuten',
    '2.5 Minuten',
    '3 Minuten',
    '3.5 Minuten',
    '4 Minuten',
    '4.5 Minuten',
    '5 Minuten',
  ]);

  /**
   * Signal containing the options for the number of sets.
   */
  amountOfSetsOptions = signal([1, 2, 3, 4, 5, 6, 7, 8]);

  /**
   * Signal containing the labels for the number of sets.
   */
  amountofSetsLabels = signal(['1 Set', '2 Sets', '3 Sets', '4 Sets', '5 Sets', '6 Sets', '7 Sets', '8 Sets']);

  /**
   * Signal containing the available RPE (Rate of Perceived Exertion) options.
   */
  rpeOptions = signal([6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10]);

  /**
   * Signal containing the labels for RPE options.
   */
  rpeOptionsLabels = signal(['RPE 6', 'RPE 6.5', 'RPE 7', 'RPE 7.5', 'RPE 8', 'RPE 8.5', 'RPE 9', 'RPE 9.5', 'RPE 10']);

  /**
   * Signal containing the options for the number of repetitions.
   */
  repsOptions = signal([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);

  /**
   * Signal containing the labels for repetition options.
   */
  repsOptionsLabels = signal([
    '3 Reps',
    '4 Reps',
    '5 Reps',
    '6 Reps',
    '7 Reps',
    '8 Reps',
    '9 Reps',
    '10 Reps',
    '11 Reps',
    '12 Reps',
    '13 Reps',
    '14 Reps',
    '15 Reps',
  ]);

  constructor(
    private modalService: ModalService,
    private headerService: HeaderService,
    private exerciseService: ExerciseService,
    private formService: FormService,
    private autoSaveService: AutoSaveService,
    private destroyRef: DestroyRef,
  ) {}

  /**
   * Initializes the component, loads exercise data, and sets up a subscription
   * to save data automatically when an interactive element changes.
   */
  ngOnInit(): void {
    this.exerciseData$ = this.exerciseService.loadExerciseData();

    this.setHeadlineInfo();

    this.autoSaveService.inputChanged$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.exerciseService.updateExercises(this.formService.getChanges()).subscribe(() => {
        this.formService.clearChanges();
      });
    });
  }

  setHeadlineInfo() {
    const nmoreOptions: MoreOptionListItem[] = [
      { label: 'Zurücksetzen', icon: IconName.Trash, callback: () => this.showResetExercisesModal() },
    ];

    this.headerService.setHeadlineInfo({
      title: 'Exercises',
      buttons: [{ icon: IconName.MORE_VERTICAL, options: nmoreOptions }],
    });
  }

  /**
   * Resets the exercises to their default settings after confirming via a modal dialog.
   */
  showResetExercisesModal(): void {
    const basicInfoModalOptions = new BasicInfoModalOptionsBuilder()
      .setTitle('Übungen zurücksetzen')
      .setButtonText('Zurücksetzen')
      .setIsDestructiveAction(true)
      .setInfoText(
        'Bist du dir sicher, dass du die Übungen auf die Standarteinstellungen zurücksetzen willst? Die Änderungen können danach nicht wieder rückgängig gemacht werden!',
      )
      .setOnSubmitCallback(async () => this.resetExercsies())
      .build();

    this.modalService.openBasicInfoModal(basicInfoModalOptions);
  }

  resetExercsies(): void {
    this.exerciseData$ = this.exerciseService.resetExercises();
  }
}
