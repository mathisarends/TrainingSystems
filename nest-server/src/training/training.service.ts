import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EditTrainingPlanDto } from './dto/edit-training-plan.dto';
import { TrainingPlan } from './model/training-plan.schema';

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
}
