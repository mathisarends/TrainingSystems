import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TrainingPlan } from './model/training-plan.schema';

@Injectable()
export class TrainingService {
  constructor(
    @InjectModel(TrainingPlan.name)
    private readonly trainingPlanModel: Model<TrainingPlan>,
  ) {}

  async deleteByUserAndTrainingId(userId: string, trainingPlanId: string) {
    const deleteResult = await this.trainingPlanModel.deleteOne({
      userId: userId,
      _id: trainingPlanId,
    });

    if (deleteResult.deletedCount === 0) {
      throw new NotFoundException('Trainingplan was not found');
    }
  }
}
