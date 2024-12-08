import { Body, Controller, Delete, Get, Patch } from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { ApiData } from 'src/types/api-data';
import { ExerciseUpdateService } from './exercise-update.service';
import { ExerciseService } from './exercise.service';
import { ExerciseCategoryType } from './types/exercise-category-type.enum';

@Controller('exercise')
export class ExerciseController {
  constructor(
    private readonly exerciseService: ExerciseService,
    private readonly exerciseUpdateService: ExerciseUpdateService,
  ) {}

  @Get()
  async getCategories(@GetUser() userId: string) {
    return this.exerciseService.getExercises(userId);
  }

  @Patch()
  async updateUserExercises(@GetUser() userId: string, @Body() updatedExercises: ApiData) {
    return await this.exerciseUpdateService.updateExercisesForUser(userId, updatedExercises);
  }

  @Delete()
  async resetExercises(@GetUser() userId: string) {
    return await this.exerciseService.setDefaultExercisesForUser(userId);
  }

  @Get('categories')
  getAvailableCategorys() {
    return Object.values(ExerciseCategoryType).filter((category) => category !== ExerciseCategoryType.PLACEHOLDER);
  }
}
