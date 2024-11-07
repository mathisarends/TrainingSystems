import { Injectable } from '@nestjs/common';
import { EditTrainingPlanDto } from '../dto/edit-training-plan.dto';
import { TrainingPlanEditViewDto } from '../dto/training-plan-edit-view.dto';
import { TrainingPlan } from '../model/training-plan.model';
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
      trainingDays: trainingPlan.trainingDays,
      weightRecommandationBase: trainingPlan.weightRecommandationBase,
      trainingBlockLength: trainingPlan.trainingWeeks.length,
      coverImageBase64: trainingPlan.coverImageBase64 || '',
    };
  }

  // TODO: Das verlängern der Blocklänge funktioniert hier aufjedenfall noch nicht.
  async editTrainingPlan(
    userId: string,
    trainingPlanId: string,
    editTrainingPlanDto: EditTrainingPlanDto,
  ) {
    const trainingPlan = await this.trainingService.getPlanByUserAndTrainingId(
      userId,
      trainingPlanId,
    );

    return await this.trainingService.updateTrainingPlan(
      trainingPlan,
      editTrainingPlanDto,
    );
  }
}
