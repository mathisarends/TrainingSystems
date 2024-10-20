import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { CreateTrainingPlanService } from './create-training-plan.service';
import { CreateTrainingPlanDto } from './dto/training-plan.dto';
import { TrainingPlanCardViewService } from './training-plan-card-view.service';
import { TrainingPlanUtilsService } from './training-plan-utils.service';
import { TrainingService } from './training.service';

// TODO: hier in mehere Router splitten
@Controller('training')
export class TrainingController {
  constructor(
    private readonly trainingPlanUtilsService: TrainingPlanUtilsService,
    private readonly createTrainingPlanService: CreateTrainingPlanService,
    private readonly trainingPlanCardViewService: TrainingPlanCardViewService,
    private readonly trainingService: TrainingService,
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

  @Delete(':id')
  async deleteTrainingPlan(
    @Req() request: Request,
    @Param('id') trainingPlanId: string,
  ) {
    console.log('🚀 ~ TrainingController ~ trainingPlanId:', trainingPlanId);
    const user = request['user'];
    console.log('userid', user.id);

    return await this.trainingService.deleteByUserAndTrainingId(
      user.id,
      trainingPlanId,
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
