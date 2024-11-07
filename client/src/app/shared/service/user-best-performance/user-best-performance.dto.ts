import { ExerciseCategories } from "../../../features/training-plans/model/exercise-categories";

export interface UserBestPerformanceDto {
    userId: string; 
    category: ExerciseCategories;
    exerciseName: string;
    sets: number; 
    reps: number; 
    weight: number; 
    actualRPE: number; 
    estMax: number; 
    achievedAt: Date; 
    previousRecords: {
      sets: number;
      reps: number; 
      weight: number;
      actualRPE: number;
      estMax: number; 
      achievedAt: Date; 
    }[];
  }