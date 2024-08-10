import { TrainingDay } from './training-day';

export class TrainingPlanDto {
  title!: string;
  trainingFrequency!: number;
  trainingBlockLength!: number;
  trainingDay!: TrainingDay;
  previousTrainingDay?: TrainingDay;

  constructor() {}

  setData(data: TrainingPlanDto) {
    this.title = data.title;
    this.trainingFrequency = data.trainingFrequency;
    this.trainingBlockLength = data.trainingBlockLength;
    this.trainingDay = data.trainingDay;
    this.previousTrainingDay = data.previousTrainingDay;
  }
}
