import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { ExerciseCategories } from '../../training-plans/model/exercise-categories';
import { ExerciseDataService } from '../../training-plans/training-view/exercise-data.service';
import { PauseTimeService } from '../../training-plans/training-view/services/pause-time.service';
import { Exercise } from '../../training-plans/training-view/training-exercise';
import { EstMaxService2 } from '../estMax2.service';
import { RpeInputComponent } from '../inputs/rpe/rpe-input.component';
import { WeightInputComponent } from '../inputs/weight/weight-input.component';

// TODO: hier in den Aufrufstellen einen weg finden tatsächlich das two way binding hier zu verwenden, damit die Datenstruktur immer aktuell bleibt
@Component({
  selector: 'app-training-view-table-row',
  standalone: true,
  imports: [DropdownComponent, FormsModule, CommonModule, RpeInputComponent, WeightInputComponent],
  templateUrl: './training-view-table-row.component.html',
  styleUrls: ['./training-view-table-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [EstMaxService2],
})
export class TrainingViewTableRowComponent {
  exercise = model.required<Exercise>();

  constructor(
    protected exerciseDataService: ExerciseDataService,
    private estMaxService2: EstMaxService2,
    private pauseTimeService: PauseTimeService,
  ) {
    effect(() => {
      const exercise = this.exercise();
      console.log('🚀 ~ TrainingViewTableRowComponent ~ effect ~ exercise:', exercise);
    });
  }

  protected onWeightChanged(weight: string) {
    this.updateExerciseProperty('weight', weight);

    const estMax = this.estMaxService2.calcEstMax(this.exercise());
    this.updateExerciseProperty('estMax', estMax);

    const pauseTime = this.exerciseDataService.categoryPauseTimes()[this.exercise().category];

    if (pauseTime) {
      this.pauseTimeService.startPauseTimer(pauseTime, this.exercise().exercise);
    }
  }

  protected onRepsChange(reps: number) {
    this.updateExerciseProperty('reps', reps);

    const estMax = this.estMaxService2.calcEstMax(this.exercise());

    this.updateExerciseProperty('estMax', estMax);
  }

  protected onAcutalRpeChange(rpe: string) {
    this.updateExerciseProperty('actualRPE', rpe);

    const estMax = this.estMaxService2.calcEstMax(this.exercise());

    this.updateExerciseProperty('estMax', estMax);
  }

  protected onExerciseCategoryChange(exerciseCategory: string) {
    this.updateExerciseProperty('category', exerciseCategory);

    const firstAvailableExcercise = this.exerciseDataService.categorizedExercises()[exerciseCategory][0];
    this.updateExerciseProperty('exercise', firstAvailableExcercise);

    if (this.isPlaceholderCategory(exerciseCategory)) {
      this.exercise.update((current) => ({
        ...current,
        sets: 0,
        reps: 0,
        weight: undefined,
        targetRPE: 0,
        actualRPE: undefined,
        estMax: 0,
        notes: '',
      }));
    } else {
      const { defaultSets, defaultReps, defaultRPE } =
        this.exerciseDataService.defaultRepSchemeByCategory()[exerciseCategory];

      this.exercise.update((current) => ({
        ...current,
        sets: defaultSets,
        reps: defaultReps,
        weight: undefined,
        targetRPE: defaultRPE,
        actualRPE: undefined,
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

  private isPlaceholderCategory(exerciseCategory: string): boolean {
    return exerciseCategory === ExerciseCategories.PLACEHOLDER;
  }
}
