import { Injectable } from '@nestjs/common';
import { EditTrainingPlanDto } from '../dto/edit-training-plan.dto';
import { TrainingPlanEditViewDto } from '../dto/training-plan-edit-view.dto';
import { TrainingPlan } from '../model/training-plan.schema';
import { TrainingService } from '../training.service';

@Injectable()
export class EditTrainingPlanService {
  constructor(private readonly trainingService: TrainingService) {}

  async getEditViewOfTrainingPlan(
    userId: string,
    trainingPlanId: string,
  ): Promise<TrainingPlanEditViewDto> {
    const trainingPlan = await this.trainingService.getPlanByUserAndTrainingId(
      userId,
      trainingPlanId,
    );

    return this.mapToEditViewDto(trainingPlan);
  }

  private mapToEditViewDto(
    trainingPlan: TrainingPlan,
  ): TrainingPlanEditViewDto {
    return {
      id: trainingPlan.id,
      title: trainingPlan.title,
      trainingFrequency: trainingPlan.trainingFrequency,
      weightRecommandationBase: trainingPlan.weightRecommandationBase,
      trainingBlockLength: trainingPlan.trainingWeeks.length,
      coverImageBase64: trainingPlan.coverImageBase64 || '',
    };
  }

  async editTrainingPlan(
    userId: string,
    trainingPlanId: string,
    editTrainingPlanDto: EditTrainingPlanDto,
  ) {
    const trainingPlan = await this.trainingService.getPlanByUserAndTrainingId(
      userId,
      trainingPlanId,
    );

    this.trainingService.updateTrainingPlan(trainingPlan, editTrainingPlanDto);
  }
}
