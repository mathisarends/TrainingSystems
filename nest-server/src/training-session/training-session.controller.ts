import { Controller, Get } from '@nestjs/common';
import { TrainingSessionService } from './training-session.service';

@Controller('training-session')
export class TrainingSessionController {
  constructor(
    private readonly trainingSessionService: TrainingSessionService,
  ) {}

  @Get()
  getTrainingSessionCardViews() {
    return this.trainingSessionService.getTrainingSessionCardViews();
  }
}
