import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { ExerciseCategories } from '../../training-plans/model/exercise-categories';
import { ExerciseDataService } from '../../training-plans/training-view/exercise-data.service';
import { PauseTimeService } from '../../training-plans/training-view/services/pause-time.service';
import { Exercise } from '../../training-plans/training-view/training-exercise';
import { TargetRpeDirective } from '../directives/target-rpe.directive';
import { EstMaxService2 } from '../estMax2.service';
import { RpeInputComponent } from '../inputs/rpe/rpe-input.component';
import { WeightInputComponent } from '../inputs/weight/weight-input.component';

@Component({
  selector: 'app-training-view-table-row',
  standalone: true,
  imports: [DropdownComponent, FormsModule, CommonModule, RpeInputComponent, WeightInputComponent, TargetRpeDirective],
  templateUrl: './training-view-table-row.component.html',
  styleUrls: ['./training-view-table-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [EstMaxService2],
})
export class TrainingViewTableRowComponent {
  exercise = model.required<Exercise>();

  isPlaceholderCategory = computed(() => this.exercise().category === ExerciseCategories.PLACEHOLDER);

  constructor(
    protected exerciseDataService: ExerciseDataService,
    private estMaxService2: EstMaxService2,
    private pauseTimeService: PauseTimeService,
  ) {}

  /**
   * Handles changes to the weight input, updates estMax, and starts the pause timer.
   */
  protected onWeightChanged(weight: string): void {
    this.updateExerciseProperty('weight', weight);
    this.updateEstMax();
    this.startPauseTimer();
  }

  /**
   * Handles changes to the reps input and updates estMax.
   */
  protected onRepsChange(reps: number): void {
    this.updateExerciseProperty('reps', reps);
    this.updateEstMax();
  }

  /**
   * Handles changes to the actual RPE input and updates estMax.
   */
  protected onActualRpeChange(rpe: string): void {
    this.updateExerciseProperty('actualRPE', rpe);
    this.updateEstMax();
  }

  /**
   * Handles changes to the exercise category and resets exercise defaults.
   */
  protected onExerciseCategoryChange(exerciseCategory: string): void {
    const isPlaceholder = exerciseCategory === ExerciseCategories.PLACEHOLDER;
    const defaultValues = isPlaceholder ? this.getPlaceholderDefaults() : this.getCategoryDefaults(exerciseCategory);

    this.updateExercise({
      category: exerciseCategory,
      exercise: this.getFirstExercise(exerciseCategory),
      ...defaultValues,
    });
  }

  /**
   * Updates a specific property of the `exercise` signal.
   */
  protected updateExerciseProperty<K extends keyof Exercise>(key: K, value: Exercise[K]): void {
    this.exercise.update((current) => ({
      ...current,
      [key]: value,
    }));
  }

  /**
   * Updates multiple properties of the exercise signal in one call.
   */
  private updateExercise(updates: Partial<Exercise>): void {
    this.exercise.update((current) => ({
      ...current,
      ...updates,
    }));
  }

  /**
   * Calculates and updates the estimated max value for the exercise.
   */
  private updateEstMax(): void {
    const estMax = this.estMaxService2.calcEstMax(this.exercise());
    this.updateExerciseProperty('estMax', estMax);
  }

  /**
   * Starts the pause timer based on the current exercise category, if applicable.
   */
  private startPauseTimer(): void {
    const pauseTime = this.exerciseDataService.categoryPauseTimes()[this.exercise().category];
    if (pauseTime) {
      this.pauseTimeService.startPauseTimer(pauseTime, this.exercise().exercise);
    }
  }

  /**
   * Retrieves default values for a placeholder category.
   */
  private getPlaceholderDefaults(): Partial<Exercise> {
    return {
      sets: 0,
      reps: 0,
      weight: undefined,
      targetRPE: 0,
      actualRPE: undefined,
      estMax: 0,
      notes: '',
    };
  }

  /**
   * Retrieves default values for a given category.
   */
  private getCategoryDefaults(category: string): Partial<Exercise> {
    const { defaultSets, defaultReps, defaultRPE } = this.exerciseDataService.defaultRepSchemeByCategory()[category];
    return {
      sets: defaultSets,
      reps: defaultReps,
      weight: undefined,
      targetRPE: defaultRPE,
      actualRPE: undefined,
      estMax: 0,
      notes: '',
    };
  }

  /**
   * Returns the first available exercise for a given category.
   */
  private getFirstExercise(category: string): string {
    return this.exerciseDataService.categorizedExercises()[category]?.[0] || '';
  }
}
