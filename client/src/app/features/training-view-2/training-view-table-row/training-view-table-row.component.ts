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
import { TrainingViewTableRowService } from './training-view-table-row.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { skip } from 'rxjs';
import { TrainingPlanDataService } from '../../training-plans/training-view/services/training-plan-data.service';
import { UserBestPerformanceService } from '../../../shared/service/user-best-performance/user-best-performance.service';

@Component({
  selector: 'app-training-view-table-row',
  standalone: true,
  imports: [DropdownComponent, FormsModule, CommonModule, RpeInputComponent, WeightInputComponent, TargetRpeDirective],
  templateUrl: './training-view-table-row.component.html',
  styleUrls: ['./training-view-table-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingViewTableRowComponent {
  exercise = model.required<Exercise>();

  weightRecommendation = computed(() => this.getWeightRecommendation());

  isPlaceholderCategory = computed(() => this.exercise().category === ExerciseCategories.PLACEHOLDER);

  constructor(
    protected exerciseDataService: ExerciseDataService,
    private trainingViewTableRowService: TrainingViewTableRowService,
    private trainingPlanDataService: TrainingPlanDataService,
    private estMaxService2: EstMaxService2,
    private pauseTimeService: PauseTimeService,
    private userBestPerformanceService: UserBestPerformanceService,
  ) {
    toObservable(this.exercise)
      .pipe(skip(1))
      .subscribe((exercise) => {
        if (exercise.category === ExerciseCategories.PLACEHOLDER) {
          this.trainingViewTableRowService.deleteExercise(exercise).subscribe((deletedExercise) => {
            this.handleExerciseDeletion(deletedExercise);
          });
        } else {
          this.trainingViewTableRowService.saveExercise(exercise).subscribe((savedExercise) => {
            this.trainingPlanDataService.findTempEntryAndUpdateWithActualValues(savedExercise);
            this.exercise().id = savedExercise.id;
          });
        }
      });
  }

  /**
   * Handles changes to the weight input, updates estMax, and starts the pause timer.
   */
  protected async onWeightChanged(weight: string): Promise<void> {
    this.updateExerciseProperty('weight', weight);

    // TODO: hier könnte man ansetzen und das weight parsen wenn es im richtigen Foramt ist und dann über einen optionalen
    // Parameter dieses für die estMax calculation nutzen
    this.updateEstMax();
    await this.startPauseTimer();
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
    const defaultValues = isPlaceholder
      ? this.exerciseDataService.getPlaceholderDefaults()
      : this.exerciseDataService.getCategoryDefaults(exerciseCategory);

    this.updateExercise({
      category: exerciseCategory,
      exercise: this.exerciseDataService.getFirstExercise(exerciseCategory),
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
  /**
   * Calculates and updates the estimated max value for the exercise.
   */
  private updateEstMax(): void {
    const estMax = this.estMaxService2.calcEstMax(this.exercise());

    if (!estMax) {
      this.updateExerciseProperty('estMax', estMax);
      return;
    }

    // TODO: please fix this and refactor best performance service after it
    /*if (this.userBestPerformanceService.isNewBestPerformance(this.exercise().category, estMax)) {
      this.userBestPerformanceService.makeNewBestPerformanceEntry(this.exercise(), estMax);
    }*/

    const backoffWeight = this.estMaxService2.calcBackoffForNextExercise(
      this.exercise(),
      this.trainingPlanDataService.exercises(),
    );

    if (backoffWeight !== undefined) {
      this.trainingPlanDataService.updateWeightRecommendation(this.exercise(), backoffWeight);
    }

    this.updateExerciseProperty('estMax', estMax);
  }

  /**
   * Starts the pause timer based on the current exercise category, if applicable.
   */
  private async startPauseTimer(): Promise<void> {
    const pauseTime = this.exerciseDataService.categoryPauseTimes()[this.exercise().category];
    if (pauseTime) {
      await this.pauseTimeService.startPauseTimer(pauseTime, this.exercise().exercise);
    }
  }

  /**
   * Handles the deletion of an exercise.
   * Removes the exercise from the training plan data and updates the table.
   */
  private handleExerciseDeletion(deletedExercise: Exercise): void {
    const indexToRemove = this.trainingPlanDataService
      .exercises()
      .findIndex((existingExercise) => existingExercise.id === deletedExercise.id);

    if (indexToRemove !== -1) {
      this.trainingPlanDataService.exercises().splice(indexToRemove, 1);
    }
  }

  private getWeightRecommendation(): string {
    const exerciseId = this.exercise().id;

    if (!exerciseId) {
      return '';
    }

    return this.trainingPlanDataService.weightRecommendationMap().get(exerciseId) ?? '';
  }
}
