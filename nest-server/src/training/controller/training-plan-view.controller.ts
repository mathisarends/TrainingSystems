import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { User } from 'src/users/user.model';
import { TrainingPlanViewService } from '../service/training-plan-view.service';

@Controller('training-plan/view')
export class TrainingPlanViewController {
  constructor(
    private readonly trainingPlanViewService: TrainingPlanViewService,
  ) {}

  @Get(':id/:week/:day')
  async getTrainingDayData(
    @GetUser() user: User,
    @Param('id') trainingPlanId: string,
    @Param('week', ParseIntPipe) weekIndex: number,
    @Param('day', ParseIntPipe) dayIndex: number,
  ) {
    return await this.trainingPlanViewService.getTrainingDayView(
      user.id,
      trainingPlanId,
      weekIndex,
      dayIndex,
    );
  }
}
