import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../components/toast/toast.service';
import { BasicInfoComponent } from '../modal-pages/basic-info/basic-info.component';
import { ExerciseTableSkeletonComponent } from '../../components/loaders/exercise-table-skeleton/exercise-table-skeleton.component';
import { ExerciseDataDTO } from '../training-view/exerciseDataDto';
import { FormService } from '../../core/form.service';
import { InteractiveElementService } from '../../../service/util/interactive-element.service';
import { InteractiveElementDirective } from '../../../directives/interactive-element.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ExerciseService } from '../training-view/exercise.service.';
import { InputComponent } from '../../components/input/input.component';
import { SelectComponent } from '../../components/select/select.component';
import { ModalService } from '../../core/services/modal/modalService';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [CommonModule, ExerciseTableSkeletonComponent, InteractiveElementDirective, SelectComponent, InputComponent],
  providers: [ExerciseService],
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.scss', '../../../css/tables.scss'],
})
export class ExercisesComponent implements OnInit {
  /**
   * Observable that emits the exercise data or null if there's an error or it's still loading.
   */
  exerciseData$!: Observable<ExerciseDataDTO>;

  /**
   * Maximum number of exercises to display.
   */
  maxExercises = 8;

  pauseTimeOptions = signal([60, 90, 120, 150, 180, 210, 240, 270, 300]);

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

  amountOfSetsOptions = signal([1, 2, 3, 4, 5, 6, 7, 8]);
  amountofSetsLabels = signal(['1 Set', '2 Sets', '3 Sets', '4 Sets', '5 Sets', '6 Sets', '7 Sets', '8 Sets']);

  rpeOptions = signal([6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10]);
  rpeOptionsLabels = signal(['RPE 6', 'RPE 6.5', 'RPE 7', 'RPE 7.5', 'RPE 8', 'RPE 8.5', 'RPE 9', 'RPE 9.5', 'RPE 10']);

  repsOptions = signal([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
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
    private interactiveElementService: InteractiveElementService,
    private destroyRef: DestroyRef,
  ) {}

  /**
   * Initializes the component, loads exercise data, and sets up a subscription
   * to save data automatically when an interactive element changes.
   */
  ngOnInit(): void {
    this.exerciseData$ = this.exerciseService.loadExerciseData();

    this.interactiveElementService.inputChanged$
      .pipe(takeUntilDestroyed(this.destroyRef)) // Automatically unsubscribe
      .subscribe(() => {
        this.saveExerciseData();
      });
  }

  saveExerciseData(): void {
    this.exerciseService.updateExercises(this.formService.getChanges()).subscribe({
      error: (error) => {
        this.toastService.error('Speichern war nicht erfolgreich');
        console.error('Error updating user exercises:', error);
      },
    });
  }

  async onReset(event: Event): Promise<void> {
    event.preventDefault();
    const confirmed = await this.modalService.open({
      component: BasicInfoComponent,
      title: 'Übungen zurücksetzen',
      buttonText: 'Zurücksetzen',
      componentData: {
        text: '  Bist du dir sicher, dass du die Übungen auf die Standarteinstellungen zurücksetzen willst? Die Änderungen können danach nicht wieder rückgängig gemacht werden!',
      },
    });

    if (confirmed) {
      this.exerciseService.resetExercises().subscribe({
        next: () => {
          this.exerciseData$ = this.exerciseService.loadExerciseData();
          this.toastService.success('Übungskatalog zurückgesetzt!');
        },
        error: (error) => {
          this.toastService.success('Übungskatalog nicht zurückgesetzt!');
          console.error('Error resetting exercises:', error);
        },
      });
    }
  }
}
