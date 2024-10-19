import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { ExerciseService } from './exercise.service';

@Controller('exercise')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Get()
  getCategories(@Req() request: Request) {
    const user = request['user'];
    return this.exerciseService.getExercises(user);
  }
}
