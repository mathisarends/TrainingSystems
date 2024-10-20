import { Body, Controller, Delete, Get, Patch, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiData } from 'src/types/api-data';
import { ExerciseUpdateService } from './exercise-update.service';
import { ExerciseService } from './exercise.service';

@Controller('exercise')
export class ExerciseController {
  constructor(
    private readonly exerciseService: ExerciseService,
    private readonly exerciseUpdateService: ExerciseUpdateService,
  ) {}

  @Get()
  getCategories(@Req() request: Request) {
    const user = request['user'];
    return this.exerciseService.getExercises(user);
  }

  @Patch()
  updateUserExercises(
    @Req() request: Request,
    @Body() updatedExercises: ApiData,
  ) {
    const user = request['user'];
    return this.exerciseUpdateService.updateExercisesForUser(
      user,
      updatedExercises,
    );
  }

  @Delete()
  async resetExercises(@Req() request: Request) {
    const user = request['user'];
    return await this.exerciseService.setDefaultExercisesForUser(user);
  }
}
