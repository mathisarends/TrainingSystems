import { Injectable } from '@nestjs/common';
import { TrainingService } from '../training.service';

@Injectable()
export class TrainingPlanViewUpdateService {
  constructor(private readonly trainingService: TrainingService) {}
}
