import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { CreateTrainingPlanDto } from './dto/training-plan.dto';
import { TrainingService } from './training.service';

@Controller('training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post()
  async createTrainingPlan(
    @Req() request: Request,
    @Body() createTrainingPlanDto: CreateTrainingPlanDto,
  ) {
    const user = request['user'];
    return await this.trainingService.createTrainingPlan(
      user.id,
      createTrainingPlanDto,
    );
  }
}
