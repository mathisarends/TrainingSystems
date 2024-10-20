import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post
} from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { User } from 'src/users/user.model';
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
    @GetUser() user: User,
    @Body() createTrainingPlanDto: CreateTrainingPlanDto,
  ) {
    return await this.createTrainingPlanService.createTrainingPlan(
      user.id,
      createTrainingPlanDto,
    );
  }

  @Delete(':id')
  async deleteTrainingPlan(
    @GetUser() user: User,
    @Param('id') trainingPlanId: string,
  ) {
    return await this.trainingService.deleteByUserAndTrainingId(
      user.id,
      trainingPlanId,
    );
  }

  @Get('titles')
  async getTrainingPlanTitles(@GetUser() user: User): Promise<string[]> {
    return await this.trainingPlanUtilsService.getTrainingPlanTitlesForUser(
      user.id,
    );
  }

  @Get('most-recent-plan-link')
  async getMostRecentTrainingPlanLink(@GetUser() user: User): Promise<string> {
    return await this.trainingPlanUtilsService.getMostRecentTrainingPlanLink(
      user.id,
    );
  }
}
