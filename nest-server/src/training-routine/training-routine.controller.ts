import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { GetUser } from 'src/decorators/user.decorator';
import { CreateTrainingRoutineDto } from './dto/create-training-routine.dto';
import { EditTrainingRoutineDto } from './dto/edit-training-routine.dto';
import { TrainingRoutineCardViewDto } from './model/training.-routine-card-view';
import { TrainingRoutineService } from './training-routine.service';

@Controller('training-routine')
export class TrainingRoutineController {
  constructor(
    private readonly trainingRoutineService: TrainingRoutineService,
  ) {}

  @Get('/')
  async getTrainingSessionCardViews(
    @GetUser() userId: string,
  ): Promise<TrainingRoutineCardViewDto[]> {
    return await this.trainingRoutineService.geTrainingRoutineCardViews(userId);
  }

  @Get('/title/:id')
  async getTrainingSessionTitleById(
    @GetUser() userId: string,
    @Param('id') trainingRoutineId: string,
    @Res() res: Response,
  ) {
    const trainingRoutine =
      await this.trainingRoutineService.getTrainingRoutineByUserAndRoutineId(
        userId,
        trainingRoutineId,
      );
    const title = trainingRoutine.title;
    return { title };
  }

  @Get('/:id')
  async getTrainingSessionById(
    @GetUser() userId: string,
    @Param('id') trainingRoutineId: string,
  ) {
    return await this.trainingRoutineService.getTrainingRoutineByUserAndRoutineId(
      userId,
      trainingRoutineId,
    );
  }

  @Post('/create')
  async createTrainingSession(
    @GetUser() userId: string,
    @Body() createTrainingRoutineDto: CreateTrainingRoutineDto,
  ) {
    return await this.trainingRoutineService.createTrainingRoutine(
      userId,
      createTrainingRoutineDto,
    );
  }

  @Put('/edit/:id')
  async editTrainingSession(
    @GetUser() userId: string,
    @Param('id') id: string,
    @Body() editTrainingRoutineDto: EditTrainingRoutineDto,
  ) {
    return await this.trainingRoutineService.editTrainingRoutine(
      userId,
      editTrainingRoutineDto,
    );
  }

  @Delete('/:id')
  async deleteTrainingSession(
    @GetUser() userId: string,
    @Param('id') trainingRoutineId: string,
  ) {
    return this.trainingRoutineService.deleteTrainingRoutineById(
      userId,
      trainingRoutineId,
    );
  }

  @Post('/start/:id')
  startTrainingSession(@GetUser() userId: string, @Param('id') id: string) {}

  @Get('/:id/latest-version')
  getLatestVersionOfSession(
    @GetUser() userId: string,
    @Param('id') id: string,
  ) {}

  @Get('/:id/:version')
  getTrainingSessionByVersion(
    @GetUser() userId: string,
    @Param('id') id: string,
    @Param('version') version: number,
  ) {}

  @Patch('/:id/:version')
  updateTrainingSessionVersion(
    @GetUser() userId: string,
    @Param('id') id: string,
    @Param('version') version: number,
    @Body() updateSessionDto: EditTrainingRoutineDto,
  ) {}
}
