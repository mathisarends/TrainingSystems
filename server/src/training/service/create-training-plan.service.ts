import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { CreateTrainingPlanDto } from '../dto/create-training-plan.dto';
import { TrainingPlan } from '../model/training-plan.model';

@Injectable()
export class CreateTrainingPlanService {
  constructor(
    @InjectModel(TrainingPlan.name)
    private readonly trainingPlanModel: Model<TrainingPlan>,
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
}
