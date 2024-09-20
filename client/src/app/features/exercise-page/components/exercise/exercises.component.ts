import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { FormService } from '../../../../core/services/form.service';
import { ModalService } from '../../../../core/services/modal/modalService';
import { DropdownComponent } from '../../../../shared/components/dropdown/dropdown.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { InteractiveElementDirective } from '../../../../shared/directives/interactive-element.directive';
import { AutoSaveService } from '../../../../shared/service/auto-save.service';
import { ButtonClickService } from '../../../../shared/service/button-click.service';
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
  imports: [
    CommonModule,
    ExerciseTableSkeletonComponent,
    InteractiveElementDirective,
    InputComponent,
    DropdownComponent,
  ],
  providers: [ExerciseService],
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.scss'],
})
export class ExercisesComponent implements OnInit {
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
    private toastService: ToastService,
    private modalService: ModalService,
    private exerciseService: ExerciseService,
    private formService: FormService,
    private autoSaveService: AutoSaveService,
    private buttonClickService: ButtonClickService,
    private destroyRef: DestroyRef,
  ) {}

  /**
   * Initializes the component, loads exercise data, and sets up a subscription
   * to save data automatically when an interactive element changes.
   */
  ngOnInit(): void {
    this.exerciseData$ = this.exerciseService.loadExerciseData();

    this.autoSaveService.inputChanged$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.exerciseService.updateExercises(this.formService.getChanges()).subscribe();
    });

    this.buttonClickService.buttonClick$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.onReset();
    });
  }

  /**
   * Resets the exercises to their default settings after confirming via a modal dialog.
   */
  async onReset(): Promise<void> {
    const confirmed = await this.modalService.openBasicInfoModal({
      title: 'Übungen zurücksetzen',
      buttonText: 'Zurücksetzen',
      isDestructiveAction: true,
      infoText:
        'Bist du dir sicher, dass du die Übungen auf die Standarteinstellungen zurücksetzen willst? Die Änderungen können danach nicht wieder rückgängig gemacht werden!',
    });

    if (confirmed) {
      this.exerciseService.resetExercises().subscribe(() => {
        this.exerciseData$ = this.exerciseService.loadExerciseData();
        this.toastService.success('Übungskatalog zurückgesetzt!');
      });
    }
  }
}
