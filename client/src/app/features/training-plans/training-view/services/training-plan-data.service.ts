import { Injectable, signal } from '@angular/core';
import { ExerciseCategories } from '../../model/exercise-categories';
import { Exercise } from '../training-exercise';
import { TrainingPlanDto } from '../trainingPlanDto';

@Injectable({
  providedIn: 'root',
})
export class TrainingPlanDataService {
  title = signal('');
  trainingFrequency = signal(0);
  trainingBlockLength = signal(0);
  exercises = signal<Exercise[]>([]);
  weightRecommendations = signal<string[]>([]);

  /**
   * Initializes the service state with data from a TrainingPlanDto object.
   * @param dto - The TrainingPlanDto containing data to initialize the service.
   */
  initializeFromDto(dto: TrainingPlanDto): void {
    this.title.set(dto.title);
    this.trainingFrequency.set(dto.trainingFrequency);
    this.trainingBlockLength.set(dto.trainingBlockLength);
    this.exercises.set(dto.trainingDay.exercises);
    this.weightRecommendations.set(dto.weightRecommandations);
  }

  addExercise(): void {
    const newEntry: Exercise = {
      id: undefined,
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

  removeLastExercise(): void {
    this.exercises.update((entries) => entries.slice(0, -1));
  }

  hasNoExercises(): boolean {
    return this.exercises().length === 0;
  }
}
