import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExerciseCategoryType } from 'src/exercise/types/exercise-category-type.enum';
import { TrainingDayExerciseDto } from 'src/training/training-plan-view/dto/training-day-exercise.dto';
import { UserBestPerformance } from './model/user-best-performance.model';

@Injectable()
export class UserBestPerformanceService {
  constructor(
    @InjectModel(UserBestPerformance.name)
    private userBestPerformanceModel: Model<UserBestPerformance>,
  ) {}

  async getExerciseRecordsByUserId(userId: string) {
    const records = await this.userBestPerformanceModel
      .find({ userId: userId })
      .exec();

    const recordsMap = new Map<string, UserBestPerformance>();

    Object.values(ExerciseCategoryType).forEach((category) => {
      const categoryRecord = records.find(
        (record) => record.category === category,
      );
      if (categoryRecord) {
        recordsMap.set(category, categoryRecord);
      }
    });

    return Object.fromEntries(recordsMap);
  }

  /**
   * Erstellt oder aktualisiert einen UserExerciseRecord für eine bestimmte Übung eines Benutzers.
   */
  async createOrUpdateRecord(
    userId: string,
    exerciseName: string,
    recordData: UserBestPerformance,
  ): Promise<UserBestPerformance> {
    return this.userBestPerformanceModel
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
  ): Promise<UserBestPerformance> {
    const exerciseRecord = await this.userBestPerformanceModel
      .findOne({ userId, exerciseName })
      .exec();

    if (!exerciseRecord) {
      throw new NotFoundException(
        `No exercise record found for userId ${userId} and exerciseName ${exerciseName}`,
      );
    }

    return exerciseRecord;
  }

  // TODO: hier müsste man diese findOneAndUpdate mal korrekt umsetzen?
  /**
   * Saves a new user exercise record or updates an existing one.
   */
  async saveUserRecordByExercise(
    userId: string,
    exercise: TrainingDayExerciseDto,
  ): Promise<UserBestPerformance> {
    return await this.userBestPerformanceModel
      .findOneAndUpdate(
        { userId: userId, exerciseName: exercise.exercise },
        {
          userId: userId,
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
