import {
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  Inject,
  Patch,
} from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { ApiData } from 'src/types/api-data';
import { UsersService } from 'src/users/users.service';
import { ExerciseUpdateService } from './exercise-update.service';
import { ExerciseService } from './exercise.service';

@Controller('exercise')
export class ExerciseController {
  constructor(
    private readonly exerciseService: ExerciseService,
    private readonly exerciseUpdateService: ExerciseUpdateService,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
  ) {}

  @Get()
  async getCategories(@GetUser() userId: string) {
    const user = await this.userService.getUserById(userId);
    return this.exerciseService.getExercises(user);
  }

  @Patch()
  async updateUserExercises(
    @GetUser() userId: string,
    @Body() updatedExercises: ApiData,
  ) {
    const user = await this.userService.getUserById(userId);
    return this.exerciseUpdateService.updateExercisesForUser(
      user,
      updatedExercises,
    );
  }

  @Delete()
  async resetExercises(@GetUser() userId: string) {
    const user = await this.userService.getUserById(userId);
    return await this.exerciseService.setDefaultExercisesForUser(user);
  }
}
