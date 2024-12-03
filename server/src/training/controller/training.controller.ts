import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { GetUser } from 'src/decorators/user.decorator';
import { UsersService } from 'src/users/users.service';
import { AutoProgressionDto } from '../dto/auto-progression.dto';
import { CreateTrainingPlanDto } from '../dto/create-training-plan.dto';
import { AutoProgressionService } from '../service/auto-progression.service';
import { CreateTrainingPlanService } from '../service/create-training-plan.service';
import { TrainingPlanCardViewService } from '../service/training-plan-card-view.service';
import { TrainingPlanUtilsService } from '../service/training-plan-utils.service';
import { TrainingService } from '../training.service';

@Controller('training')
export class TrainingController {
  constructor(
    private readonly trainingPlanUtilsService: TrainingPlanUtilsService,
    private autoProgressionService: AutoProgressionService,
    private readonly createTrainingPlanService: CreateTrainingPlanService,
    private readonly trainingPlanCardViewService: TrainingPlanCardViewService,
    private readonly trainingService: TrainingService,
    private readonly userService: UsersService,
  ) {}

  @Get()
  async getTrainingPlanCardViews(@GetUser() userId: string) {
    const user = await this.userService.getUserById(userId);
    return await this.trainingPlanCardViewService.getCardViewsForUser(user);
  }

  @Post()
  async createTrainingPlan(
    @GetUser() userId: string,
    @Body() createTrainingPlanDto: CreateTrainingPlanDto,
  ) {
    return await this.createTrainingPlanService.createTrainingPlan(
      userId,
      createTrainingPlanDto,
    );
  }

  @Delete(':id')
  async deleteTrainingPlan(
    @GetUser() userId: string,
    @Param('id') trainingPlanId: string,
  ) {
    return await this.trainingService.deleteByUserAndTrainingId(
      userId,
      trainingPlanId,
    );
  }

  @Post(':id/auto-progression')
  async handleAutoProgression(
    @GetUser() userId: string,
    @Param('id') trainingPlanId: string,
    @Body() autpProgressionDto: AutoProgressionDto,
  ) {
    return await this.autoProgressionService.handleAutoProgressionForTrainingPlan(
      userId,
      trainingPlanId,
      autpProgressionDto,
    );
  }

  @Get('titles')
  async getTrainingPlanTitles(@GetUser() userId: string): Promise<string[]> {
    return await this.trainingPlanUtilsService.getTrainingPlanTitlesForUser(
      userId,
    );
  }

  @Get('/title/:id')
  async getTrainingPlanTitleById(
    @GetUser() userId: string,
    @Param('id') trainingPlanId: string,
  ) {
    const trainingPlan = await this.trainingService.getPlanByUserAndTrainingId(
      userId,
      trainingPlanId,
    );
    const title = trainingPlan.title;
    return { title };
  }

  @Get(':id/latest')
  async getLastTrainingDayOfPlan(
    @GetUser() userId: string,
    @Param('id') trainingPlanId: string,
  ) {
    const trainingPlan = await this.trainingService.getPlanByUserAndTrainingId(
      userId,
      trainingPlanId,
    );
    return trainingPlan.mostRecentTrainingDayLocator;
  }

  @Get('most-recent-plan-link')
  async getMostRecentTrainingPlanLink(
    @GetUser() userId: string,
    @Res() res: Response,
  ) {
    const link =
      await this.trainingPlanUtilsService.getMostRecentTrainingPlanLink(userId);
    return res.status(200).json(link);
  }

  @Get('next-available-start-date')
  async getNextAvailableStartDateForNewTrainingPlan(
    @GetUser() userId: string,
    @Res() res: Response,
  ) {
    const nextAvailableStartDate =
      await this.createTrainingPlanService.getNextAvailableStartDateForNewTrainingPlan(
        userId,
      );
    return res.json({ startDate: nextAvailableStartDate.toISOString() });
  }
}
