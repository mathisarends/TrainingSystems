import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { EditTrainingPlanDto } from '../dto/edit-training-plan.dto';
import { TrainingPlanEditViewDto } from '../dto/training-plan-edit-view.dto';
import { TrainingDay } from '../model/training-day.schema';
import { TrainingPlan } from '../model/training-plan.model';
import { TrainingService } from '../training.service';

@Injectable()
export class EditTrainingPlanService {
  constructor(
    private readonly trainingService: TrainingService,
    @InjectModel(TrainingDay.name)
    private readonly trainingDayModel: Model<TrainingDay>,
  ) {}

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

  async editTrainingPlan(
    userId: string,
    trainingPlanId: string,
    editTrainingPlanDto: EditTrainingPlanDto,
  ) {
    const trainingPlan = await this.trainingService.getPlanByUserAndTrainingId(
      userId,
      trainingPlanId,
    );

    if (
      !this.isTrainingFrequencyChanged(
        trainingPlan,
        editTrainingPlanDto.trainingDays.length,
      )
    ) {
      return await this.trainingService.updateTrainingPlan(
        trainingPlan,
        editTrainingPlanDto,
      );
    }

    const difference =
      trainingPlan.trainingWeeks[0].trainingDays.length -
      editTrainingPlanDto.trainingDays.length;

    if (difference > 0) {
      trainingPlan.trainingWeeks.forEach((week) => {
        week.trainingDays.splice(-difference);
      });
    } else {
      const numberOfDaysToAdd = Math.abs(difference);
      trainingPlan.trainingWeeks.forEach((week) => {
        week.trainingDays.push(
          ...Array.from({ length: numberOfDaysToAdd }, () =>
            this.createEmptyTrainingDay(),
          ),
        );
      });
    }

    return await this.trainingService.updateTrainingPlan(
      trainingPlan,
      editTrainingPlanDto,
    );
  }

  private isTrainingFrequencyChanged(
    trainingPlan: TrainingPlan,
    newAmountOfDays: number,
  ): boolean {
    return (
      trainingPlan.trainingWeeks[0].trainingDays.length !== newAmountOfDays
    );
  }

  private createEmptyTrainingDay() {
    return {
      id: uuidv4(),
      exercises: [],
    } as TrainingDay;
  }
}
