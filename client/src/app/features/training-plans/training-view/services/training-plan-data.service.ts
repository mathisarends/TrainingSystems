import { Injectable, signal } from '@angular/core';
import { Exercise } from '../training-exercise';
import { TrainingPlanDto } from '../trainingPlanDto';

@Injectable()
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
}
