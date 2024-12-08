import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TrainingPlan } from '../model/training-plan.model';

@Injectable()
export class TrainingPlanUtilsService {
  constructor(
    @InjectModel(TrainingPlan.name)
    private readonly trainingPlanModel: Model<TrainingPlan>,
    private readonly configService: ConfigService,
  ) {}

  async getTrainingPlanTitlesForUser(userId: string): Promise<string[]> {
    const trainingPlans = await this.trainingPlanModel.find({ userId });

    return trainingPlans.map((plan) => plan.title);
  }

  async getMostRecentTrainingPlanLink(userId: string): Promise<string> {
    const baseURL = this.configService.get<string>(
      process.env.NODE_ENV === 'development' ? 'DEV_BASE_URL' : 'PROD_BASE_URL',
    );

    const trainingPlans = await this.trainingPlanModel.find({ userId });

    if (!trainingPlans.length) {
      throw new NotFoundException('No training plan for user found');
    }

    const mostRecentPlan = this.getMostRecentPlan(trainingPlans);

    const { weekIndex, dayIndex } = mostRecentPlan.mostRecentTrainingDayLocator;

    return `${baseURL}/training/view?planId=${mostRecentPlan.id}&week=${weekIndex}&day=${dayIndex}`;
  }

  /**
   * Finds the most recent plan by sorting.
   */
  private getMostRecentPlan(trainingPlans: TrainingPlan[]): TrainingPlan {
    return trainingPlans.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())[0];
  }
}
