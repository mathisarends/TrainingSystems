import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { User } from 'src/users/user.model';
import { AutoProgressionDto } from '../dto/auto-progression.dto';
import { CreateTrainingPlanDto } from '../dto/create-training-plan.dto';
import { CreateTrainingPlanService } from '../service/create-training-plan.service';
import { TrainingPlanCardViewService } from '../service/training-plan-card-view.service';
import { TrainingPlanUtilsService } from '../service/training-plan-utils.service';
import { TrainingService } from '../training.service';

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
  getTrainingPlanCardViews(@GetUser() user: User) {
    return this.trainingPlanCardViewService.getCardViewsForUser(user);
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
    return await this.trainingPlanUtilsService.handleAutoProgressionForTrainingPlan(
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

  @Get('most-recent-plan-link')
  async getMostRecentTrainingPlanLink(
    @GetUser() userId: string,
  ): Promise<string> {
    return await this.trainingPlanUtilsService.getMostRecentTrainingPlanLink(
      userId,
    );
  }
}
