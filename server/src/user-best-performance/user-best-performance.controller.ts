import { Body, Controller, Delete, Get, Put, Query } from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { TrainingDayExerciseDto } from 'src/training/training-plan-view/dto/training-day-exercise.dto';
import { UserBestPerformanceService } from './user-best-performance.service';

@Controller('user-best-performance')
export class UserBestPerformanceController {
  constructor(private readonly userBestPerformanceService: UserBestPerformanceService) {}

  @Get()
  async getExerciseRecordsByUserId(@GetUser() userId: string) {
    return await this.userBestPerformanceService.getExerciseRecordsByUserId(userId);
  }

  @Put()
  async createOrUpdateRecord(@GetUser() userId: string, @Body() trainingDayExerciseDto: TrainingDayExerciseDto) {
    return await this.userBestPerformanceService.saveUserRecordByExercise(userId, trainingDayExerciseDto);
  }

  @Delete()
  async deleteMostRecentBestPerformanceEntryForExerciseName(
    @GetUser() userId: string,
    @Query('exerciseName') exerciseName: string,
  ): Promise<void> {
    return await this.userBestPerformanceService.deleteMostRecentBestPerformanceEntryForExerciseName(
      userId,
      exerciseName,
    );
  }
}
