import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { CreateTrainingPlanService } from './create-training-plan.service';
import { CreateTrainingPlanDto } from './dto/training-plan.dto';
import { MostRecentTrainingPlanService } from './most-recent-training-plan.service';

@Controller('training')
export class TrainingController {
  constructor(
    private readonly mostRecentTrainingPlanService: MostRecentTrainingPlanService,
    private createTrainingPlanService: CreateTrainingPlanService,
  ) {}

  @Post()
  async createTrainingPlan(
    @Req() request: Request,
    @Body() createTrainingPlanDto: CreateTrainingPlanDto,
  ) {
    const user = request['user'];
    return await this.createTrainingPlanService.createTrainingPlan(
      user.id,
      createTrainingPlanDto,
    );
  }

  @Get('most-recent-plan-link')
  async getMostRecentTrainingPlanLink(@Req() request: Request) {
    const user = request['user'];
    return await this.mostRecentTrainingPlanService.getMostRecentTrainingPlanLink(
      user.id,
    );
  }
}
