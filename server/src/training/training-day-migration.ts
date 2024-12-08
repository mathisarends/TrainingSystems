import { Injectable, OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { TrainingPlan } from './model/training-plan.model';
import * as crypto from 'crypto';

@Injectable()
export class MigrationAddIdsToExercises implements OnModuleInit {
  constructor(
    @InjectModel('TrainingPlan')
    private readonly trainingPlanModel: Model<TrainingPlan>,
  ) {}

  async onModuleInit() {
    console.log('Starting migration: Adding IDs to exercises...');

    const trainingPlans = await this.trainingPlanModel.find();

    for (const trainingPlan of trainingPlans) {
      let updated = false;

      for (const trainingWeek of trainingPlan.trainingWeeks) {
        for (const trainingDay of trainingWeek.trainingDays) {
          for (const exercise of trainingDay.exercises) {
            if (!exercise.id) {
              exercise.id = this.generateId();
              updated = true;
            }
          }
        }
      }

      if (updated) {
        await trainingPlan.save();
        console.log(`Updated training plan with ID: ${trainingPlan._id}`);
      }
    }

    console.log('Migration completed successfully.');
  }

  /**
   * Generates a unique ID for an exercise.
   */
  private generateId(): string {
    return crypto.randomUUID();
  }
}
