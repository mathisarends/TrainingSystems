import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { CreateTrainingPlanService } from './create-training-plan.service';
import { CreateTrainingPlanDto } from './dto/training-plan.dto';
import { TrainingPlanCardViewService } from './training-plan-card-view.service';
import { TrainingPlanUtilsService } from './training-plan-utils.service';

@Controller('training')
export class TrainingController {
  constructor(
    private readonly trainingPlanUtilsService: TrainingPlanUtilsService,
    private createTrainingPlanService: CreateTrainingPlanService,
    private readonly trainingPlanCardViewService: TrainingPlanCardViewService,
  ) {}

  @Get()
  getTrainingPlanCardViews(@Req() request: Request) {
    const user = request['user'];
    return this.trainingPlanCardViewService.getCardViewsForUser(user);
  }

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

  @Get('titles')
  async getTrainingPlanTitles(@Req() request: Request): Promise<string[]> {
    const user = request['user'];
    return await this.trainingPlanUtilsService.getTrainingPlanTitlesForUser(
      user.id,
    );
  }

  @Get('most-recent-plan-link')
  async getMostRecentTrainingPlanLink(
    @Req() request: Request,
  ): Promise<string> {
    const user = request['user'];
    return await this.trainingPlanUtilsService.getMostRecentTrainingPlanLink(
      user.id,
    );
  }
}
