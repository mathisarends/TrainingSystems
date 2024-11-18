import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { CreateTrainingPlanDto } from '../dto/create-training-plan.dto';
import { TrainingPlan } from '../model/training-plan.model';
import { TrainingService } from '../training.service';

@Injectable()
export class CreateTrainingPlanService {
  constructor(
    @InjectModel(TrainingPlan.name)
    private readonly trainingPlanModel: Model<TrainingPlan>,
    private readonly trainingService: TrainingService,
  ) {}

  async createTrainingPlan(
    userId: string,
    createTrainingPlanDto: CreateTrainingPlanDto,
  ) {
    const trainingWeeksPlaceholder = this.createNewTrainingPlanWithPlaceholders(
      createTrainingPlanDto.trainingBlockLength,
      createTrainingPlanDto.trainingDays.length,
    );

    const newTrainingPlan = new this.trainingPlanModel({
      userId: userId,
      title: createTrainingPlanDto.title,
      trainingDays: createTrainingPlanDto.trainingDays,
      lastUpdated: new Date(),
      trainingWeeks: trainingWeeksPlaceholder,
      coverImageBase64: createTrainingPlanDto.coverImageBase64,
      startDate: createTrainingPlanDto.startDate,
    });

    return await newTrainingPlan.save();
  }

  private createNewTrainingPlanWithPlaceholders(
    weeks: number,
    daysPerWeek: number,
  ) {
    return Array.from({ length: weeks }, () => ({
      trainingDays: Array.from({ length: daysPerWeek }, () => ({
        id: uuidv4(),
        exercises: [],
      })),
    }));
  }

  private async determineStartDate(userId: string): Promise<Date> {
    const userTrainingPlans =
      await this.trainingService.getTrainingPlansByUser(userId);

    if (userTrainingPlans.length === 0) {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const daysUntilNextMonday = (8 - dayOfWeek) % 7;
      now.setDate(now.getDate() + daysUntilNextMonday);
      return now;
    }

    const mostRecentTrainingPlanOfUser =
      this.getMostRecentPlan(userTrainingPlans);
    const startDate = new Date(mostRecentTrainingPlanOfUser.startDate);
    const totalDays = mostRecentTrainingPlanOfUser.trainingWeeks.length * 7;
    startDate.setDate(startDate.getDate() + totalDays);

    return startDate;
  }

  /**
   * Finds the most recent plan by sorting.
   */
  private getMostRecentPlan(trainingPlans: TrainingPlan[]): TrainingPlan {
    return trainingPlans.sort(
      (a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime(),
    )[0];
  }
}
