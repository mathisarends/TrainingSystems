import { BadRequestException, Injectable } from '@nestjs/common';
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
    const records = await this.userBestPerformanceModel.find({ userId: userId }).exec();

    const recordsMap = new Map<string, UserBestPerformance>();

    Object.values(ExerciseCategoryType).forEach((category) => {
      const categoryRecord = records.find((record) => record.category === category);
      if (categoryRecord) {
        recordsMap.set(category, categoryRecord);
      }
    });

    return Object.fromEntries(recordsMap);
  }

  async deleteMostRecentBestPerformanceEntryForExerciseName(userId: string, exerciseName: string): Promise<void> {
    const bestPerformanceForExercise = await this.userBestPerformanceModel
      .findOne({
        userId: userId,
        exerciseName: exerciseName,
      })
      .exec();

    const secondNewestBestPerformanceEntry =
      bestPerformanceForExercise.previousRecords[bestPerformanceForExercise.previousRecords.length - 1];

    bestPerformanceForExercise.sets = secondNewestBestPerformanceEntry.sets;
    bestPerformanceForExercise.reps = secondNewestBestPerformanceEntry.reps;
    bestPerformanceForExercise.weight = secondNewestBestPerformanceEntry.weight;
    bestPerformanceForExercise.actualRPE = secondNewestBestPerformanceEntry.actualRPE;
    bestPerformanceForExercise.estMax = secondNewestBestPerformanceEntry.estMax;
    bestPerformanceForExercise.achievedAt = secondNewestBestPerformanceEntry.achievedAt;

    bestPerformanceForExercise.previousRecords.pop();

    await bestPerformanceForExercise.save();
  }

  /**
   * Saves a new user exercise record or updates an existing one.
   */
  async saveUserRecordByExercise(
    userId: string,
    trainingDayExerciseDto: TrainingDayExerciseDto,
  ): Promise<UserBestPerformance> {
    const bestPerformanceForExercise = await this.userBestPerformanceModel
      .findOne({
        userId: userId,
        exerciseName: trainingDayExerciseDto.exercise,
      })
      .exec();

    if (!bestPerformanceForExercise) {
      return await this.createNewUserBestPerformance(userId, trainingDayExerciseDto);
    }

    if (trainingDayExerciseDto.estMax < bestPerformanceForExercise.weight) {
      throw new BadRequestException('The new entry is not a new pr');
    }

    const previousBestEntry = {
      sets: bestPerformanceForExercise.sets,
      reps: bestPerformanceForExercise.reps,
      weight: bestPerformanceForExercise.weight,
      actualRPE: bestPerformanceForExercise.actualRPE,
      estMax: bestPerformanceForExercise.estMax,
      achievedAt: bestPerformanceForExercise.achievedAt,
    };

    bestPerformanceForExercise.previousRecords.push(previousBestEntry);

    if (bestPerformanceForExercise.previousRecords.length > 10) {
      bestPerformanceForExercise.previousRecords.shift();
    }

    if (isNaN(bestPerformanceForExercise.weight) || isNaN(bestPerformanceForExercise.actualRPE)) {
      throw new BadRequestException('Parsing error: weight or actualRPE could not be converted to a number.');
    }

    bestPerformanceForExercise.sets = trainingDayExerciseDto.sets;
    bestPerformanceForExercise.reps = trainingDayExerciseDto.reps;
    bestPerformanceForExercise.weight = Number(trainingDayExerciseDto.weight);
    bestPerformanceForExercise.actualRPE = Number(trainingDayExerciseDto.actualRPE);
    bestPerformanceForExercise.estMax = trainingDayExerciseDto.estMax;
    bestPerformanceForExercise.achievedAt = new Date();

    return await bestPerformanceForExercise.save();
  }

  /**
   * Creates a new UserBestPerformance entry.
   */
  private async createNewUserBestPerformance(
    userId: string,
    trainingDayExerciseDto: TrainingDayExerciseDto,
  ): Promise<UserBestPerformance> {
    const newBestPerformance = new this.userBestPerformanceModel({
      userId: userId,
      exerciseName: trainingDayExerciseDto.exercise,
      category: trainingDayExerciseDto.category,
      sets: trainingDayExerciseDto.sets,
      reps: trainingDayExerciseDto.reps,
      weight: Number(trainingDayExerciseDto.weight),
      actualRPE: Number(trainingDayExerciseDto.actualRPE),
      estMax: trainingDayExerciseDto.estMax,
      achievedAt: new Date(),
      previousRecords: [],
    });

    return await newBestPerformance.save();
  }
}
