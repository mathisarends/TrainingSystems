import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { ExerciseDataService } from '../../training-plans/training-view/exercise-data.service';
import { Exercise } from '../../training-plans/training-view/training-exercise';

// TODO: hier in den Aufrufstellen einen weg finden tatsächlich das two way binding hier zu verwenden, damit die Datenstruktur immer aktuell bleibt
@Component({
  selector: 'app-training-view-table-row',
  standalone: true,
  imports: [DropdownComponent, FormsModule, CommonModule],
  templateUrl: './training-view-table-row.component.html',
  styleUrls: ['./training-view-table-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingViewTableRowComponent {
  exercise = model.required<Exercise>();

  constructor(protected exerciseDataService: ExerciseDataService) {
    effect(() => {
      const exercise = this.exercise();
      console.log('🚀 ~ TrainingViewTableRowComponent ~ effect ~ exercise:', exercise);
    });
  }

  protected onExerciseCategoryChange(exerciseCategory: string) {
    this.updateExerciseProperty('category', exerciseCategory);

    const firstAvailableExcercise = this.exerciseDataService.categorizedExercises()[exerciseCategory][0];
    this.updateExerciseProperty('exercise', firstAvailableExcercise);

    if (exerciseCategory === '- Bitte Auswählen -') {
      this.exercise.update((current) => ({
        ...current,
        sets: 0,
        reps: 0,
        weight: '0',
        targetRPE: 0,
        actualRPE: '0',
        estMax: 0,
        notes: '',
      }));
    }
  }

  /**
   * Updates a specific property of the `exercise` signal.
   * @param key The name of the property to be updated.
   * @param value The new value for the specified property.
   */
  updateExerciseProperty<K extends keyof Exercise>(key: K, value: Exercise[K]): void {
    this.exercise.update((current) => ({
      ...current,
      [key]: value,
    }));
  }
}
