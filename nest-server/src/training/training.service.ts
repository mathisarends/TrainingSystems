import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EditTrainingPlanDto } from './dto/edit-training-plan.dto';
import { TrainingDay } from './model/training-day.schema';
import { TrainingPlan } from './model/training-plan.schema';
import { TrainingWeek } from './model/training-week.schema';

@Injectable()
export class TrainingService {
  constructor(
    @InjectModel(TrainingPlan.name)
    private readonly trainingPlanModel: Model<TrainingPlan>,
  ) {}

  async getPlanByUserAndTrainingId(userId: string, trainingPlanId: string) {
    const trainingPlan = await this.trainingPlanModel.findOne({
      userId: userId,
      _id: trainingPlanId,
    });

    if (!trainingPlan) {
      throw new NotFoundException('No training plan found');
    }

    return trainingPlan;
  }

  async getCertainTrainingDay(userId: string, trainingDayId: string) {
    const trainingPlans = await this.trainingPlanModel.find({
      userId: userId,
    });

    for (const trainingPlan of trainingPlans) {
      const foundDay = this.findTrainingDayInPlan(trainingPlan, trainingDayId);
      if (foundDay) {
        return foundDay;
      }
    }

    throw new NotFoundException('Training day with the id could not be found');
  }

  async deleteByUserAndTrainingId(userId: string, trainingPlanId: string) {
    const deleteResult = await this.trainingPlanModel.deleteOne({
      userId: userId,
      _id: trainingPlanId,
    });

    if (deleteResult.deletedCount === 0) {
      throw new NotFoundException('Trainingplan was not found');
    }
  }

  async updateTrainingPlan(
    existingPlan: TrainingPlan,
    editTrainingPlanDto: EditTrainingPlanDto,
  ) {
    Object.assign(existingPlan, editTrainingPlanDto);
    return await existingPlan.save();
  }

  private findTrainingDayInPlan(
    trainingPlan: TrainingPlan,
    trainingDayId: string,
  ): TrainingDay | undefined {
    for (const trainingWeek of trainingPlan.trainingWeeks) {
      const foundDay = this.findTrainingDayInWeek(trainingWeek, trainingDayId);
      if (foundDay) {
        return foundDay;
      }
    }
    return undefined;
  }

  private findTrainingDayInWeek(
    trainingWeek: TrainingWeek,
    trainingDayId: string,
  ): TrainingDay | undefined {
    return trainingWeek.trainingDays.find((day) => day.id === trainingDayId);
  }
}
