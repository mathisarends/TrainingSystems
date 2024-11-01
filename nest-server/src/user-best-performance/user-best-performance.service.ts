import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ExerciseCategoryType } from 'src/exercise/types/exercise-category-type.enum';
import { Exercise } from 'src/training/model/exercise.schema';
import { UserExerciseRecord } from './model/user-best-performance.model';

@Injectable()
export class UserBestPerformanceService {
  constructor(
    @InjectModel(UserExerciseRecord.name)
    private userExerciseRecordModel: Model<UserExerciseRecord>,
  ) {}

  async getExerciseRecordsByUserId(
    userId: string,
  ): Promise<Map<string, UserExerciseRecord[]>> {
    const records = await this.userExerciseRecordModel.find({ userId }).exec();

    const recordsMap = new Map<string, UserExerciseRecord[]>();

    Object.values(ExerciseCategoryType).forEach((category) => {
      const categoryRecords = records.filter(
        (record) => record.category === category,
      );
      if (categoryRecords.length > 0) {
        recordsMap.set(category, categoryRecords);
      }
    });

    return recordsMap;
  }

  /**
   * Erstellt oder aktualisiert einen UserExerciseRecord für eine bestimmte Übung eines Benutzers.
   */
  async createOrUpdateRecord(
    userId: string,
    exerciseName: string,
    recordData: Partial<UserExerciseRecord>,
  ): Promise<UserExerciseRecord> {
    return this.userExerciseRecordModel
      .findOneAndUpdate(
        { userId, exerciseName },
        { ...recordData, userId, exerciseName },
        { new: true, upsert: true },
      )
      .exec();
  }

  /**
   * Holt einen bestimmten UserExerciseRecord eines Benutzers für eine bestimmte Übung
   */
  async getRecordByUserAndExercise(
    userId: string,
    exerciseName: string,
  ): Promise<UserExerciseRecord> {
    const exerciseRecord = await this.userExerciseRecordModel
      .findOne({ userId, exerciseName })
      .exec();

    if (!exerciseRecord) {
      throw new NotFoundException(
        `No exercise record found for userId ${userId} and exerciseName ${exerciseName}`,
      );
    }

    return exerciseRecord;
  }

  /**
   * Saves a new user exercise record or updates an existing one.
   */
  async saveUserRecordByExercise(
    exercise: Exercise,
    userId: string,
  ): Promise<void> {
    const userObjectId = new Types.ObjectId(userId);

    await this.userExerciseRecordModel
      .findOneAndUpdate(
        { userId: userObjectId, exerciseName: exercise.exercise },
        {
          userId: userObjectId,
          category: exercise.category as ExerciseCategoryType,
          exerciseName: exercise.exercise,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: parseFloat(exercise.weight),
          actualRPE: parseFloat(exercise.actualRPE),
          estMax: exercise.estMax,
          achievedAt: new Date(),
        },
        { new: true, upsert: true },
      )
      .exec();
  }
}
