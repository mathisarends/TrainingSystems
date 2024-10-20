import { Body, Controller, Delete, Get, Patch } from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { ApiData } from 'src/types/api-data';
import { User } from 'src/users/user.model';
import { ExerciseUpdateService } from './exercise-update.service';
import { ExerciseService } from './exercise.service';

@Controller('exercise')
export class ExerciseController {
  constructor(
    private readonly exerciseService: ExerciseService,
    private readonly exerciseUpdateService: ExerciseUpdateService,
  ) {}

  @Get()
  getCategories(@GetUser() user: User) {
    return this.exerciseService.getExercises(user);
  }

  @Patch()
  updateUserExercises(
    @GetUser() user: User,
    @Body() updatedExercises: ApiData,
  ) {
    return this.exerciseUpdateService.updateExercisesForUser(
      user,
      updatedExercises,
    );
  }

  @Delete()
  async resetExercises(@GetUser() user: User) {
    return await this.exerciseService.setDefaultExercisesForUser(user);
  }
}
