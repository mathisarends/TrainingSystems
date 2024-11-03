import { Body, Controller, Get, Param, Patch } from '@nestjs/common';

import { GetUser } from 'src/decorators/user.decorator';
import { EditTrainingPlanDto } from '../dto/edit-training-plan.dto';
import { EditTrainingPlanService } from '../service/edit-training-plan.service';

@Controller('training-plan/edit')
export class TrainingPlanEditController {
  constructor(
    private readonly editTrainingPlanService: EditTrainingPlanService,
  ) {}

  @Get(':id')
  async getEditViewOfTrainingPlan(
    @GetUser() userId: string,
    @Param('id') trainingPlanId: string,
  ) {
    return await this.editTrainingPlanService.getEditViewOfTrainingPlan(
      userId,
      trainingPlanId,
    );
  }

  @Patch(':id')
  async editTrainingPlan(
    @GetUser() userId: string,
    @Param('id') trainingPlanId: string,
    @Body() editTrainingPlanDto: EditTrainingPlanDto,
  ) {
    return await this.editTrainingPlanService.editTrainingPlan(
      userId,
      trainingPlanId,
      editTrainingPlanDto,
    );
  }
}
