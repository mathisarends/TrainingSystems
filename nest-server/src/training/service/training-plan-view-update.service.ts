import { Injectable } from '@nestjs/common';
import { TrainingService } from '../training.service';

@Injectable()
export class TrainingPlanViewUpdateService {
  constructor(private readonly trainingService: TrainingService) {}

  async updateTrainingDataForTrainingDay(userId: string, trainingPlanId: string, weekIndex: number, dayIndex: number) {
    
  }
}
