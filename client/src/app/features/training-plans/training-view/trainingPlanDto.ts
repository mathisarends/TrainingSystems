import { TrainingDay } from './training-day';

export class TrainingPlanDto {
  title!: string;
  trainingFrequency!: number;
  trainingBlockLength!: number;
  trainingDay!: Partial<TrainingDay>;
  weightRecommandations?: string[];

  setData(data: TrainingPlanDto) {
    console.log('🚀 ~ TrainingPlanDto ~ setData ~ data:', data);
    this.title = data.title;
    this.trainingFrequency = data.trainingFrequency;
    this.trainingBlockLength = data.trainingBlockLength;
    this.trainingDay = data.trainingDay;
    this.weightRecommandations = data.weightRecommandations;
  }
}
