import { TrainingDay } from '../../../../shared/models/training/trainingDay';

export interface TrainingPlanResponse {
  title: string;
  trainingFrequency: number;
  trainingBlockLength: number;
  trainingWeekIndex: number;
  trainingDayIndex: number;
  trainingDay: TrainingDay;
  exerciseCategories: string[];
  categoryPauseTimes: { [key: string]: number };
  categorizedExercises: { [key: string]: string[] };
  defaultRepSchemeByCategory: {
    [key: string]: {
      defaultSets: number;
      defaultReps: number;
      defaultRPE: number;
    };
  };
  maxFactors: any;
}
