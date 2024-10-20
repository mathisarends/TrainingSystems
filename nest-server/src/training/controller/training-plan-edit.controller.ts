import { Body, Controller, Get, Param, Patch, Req } from '@nestjs/common';

import { EditTrainingPlanDto } from '../dto/edit-training-plan.dto';
import { EditTrainingPlanService } from '../service/edit-training-plan.service';

@Controller('training-plan/edit')
export class TrainingPlanEditController {
  constructor(
    private readonly editTrainingPlanService: EditTrainingPlanService,
  ) {}

  @Get(':id')
  async getEditViewOfTrainingPlan(
    @Req() request: Request,
    @Param('id') trainingPlanId: string,
  ) {
    const user = request['user'];
    return await this.editTrainingPlanService.getEditViewOfTrainingPlan(
      user.id,
      trainingPlanId,
    );
  }

  @Patch(':id')
  async editTrainingPlan(
    @Req() request: Request,
    @Param('id') trainingPlanId: string,
    @Body() editTrainingPlanDto: EditTrainingPlanDto,
  ) {
    const user = request['user'];
    return await this.editTrainingPlanService.editTrainingPlan(
      user.id,
      trainingPlanId,
      editTrainingPlanDto,
    );
  }
}
