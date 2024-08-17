import { Component, DestroyRef, OnInit } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../service/modal/modalService';
import { ToastService } from '../../components/toast/toast.service';
import { BasicInfoComponent } from '../../basic-info/basic-info.component';
import { ExerciseTableSkeletonComponent } from '../../exercise-table-skeleton/exercise-table-skeleton.component';
import { ExerciseDataDTO } from '../training-view/exerciseDataDto';
import { FormService } from '../../../service/form/form.service';
import { InteractiveElementService } from '../../../service/util/interactive-element.service';
import { InteractiveElementDirective } from '../../../service/util/interactive-element.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ExerciseService } from '../training-view/exercise.service.';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [CommonModule, ExerciseTableSkeletonComponent, InteractiveElementDirective],
  providers: [ExerciseService],
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.scss', '../../../css/tables.scss'],
})
export class ExercisesComponent implements OnInit {
  /**
   * Observable that emits the exercise data or null if there's an error or it's still loading.
   */
  exerciseData$!: Observable<ExerciseDataDTO | null>;

  /**
   * Maximum number of exercises to display.
   */
  maxExercises = 8;

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
    this.exerciseData$ = this.loadExercises();

    this.interactiveElementService.inputChanged$
      .pipe(takeUntilDestroyed(this.destroyRef)) // Automatically unsubscribe
      .subscribe(() => {
        this.saveExerciseData();
      });
  }

  /**
   * Loads exercise data from the service and returns an Observable.
   * In case of an error, it returns an Observable that emits null.
   *
   * @returns Observable of ExerciseDataDTO or null.
   */
  private loadExercises(): Observable<ExerciseDataDTO | null> {
    return this.exerciseService.loadExerciseData().pipe(
      map((exerciseData) => exerciseData),
      catchError((error) => {
        console.error('Error loading exercises:', error);
        return of(null);
      }),
    );
  }

  saveExerciseData(): void {
    this.exerciseService.updateExercises(this.formService.getChanges()).subscribe({
      error: (error) => {
        this.toastService.show('Fehler', 'Speichern war nicht erfolgreich');
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
          this.exerciseData$ = this.loadExercises();
          this.toastService.show('Erfolg', 'Übungskatalog zurückgesetzt!');
        },
        error: (error) => {
          this.toastService.show('Fehler', 'Übungskatalog nicht zurückgesetzt!');
          console.error('Error resetting exercises:', error);
        },
      });
    }
  }
}
