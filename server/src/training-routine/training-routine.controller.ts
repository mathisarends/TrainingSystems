import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put
} from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { ApiData } from 'src/types/api-data';
import { CreateTrainingRoutineDto } from './dto/create-training-routine.dto';
import { EditTrainingRoutineDto } from './dto/edit-training-routine.dto';
import { TrainingRoutineCardViewDto } from './model/training.-routine-card-view';
import { TrainingRoutineViewService } from './training-routine-view.service';
import { TrainingRoutineService } from './training-routine.service';

@Controller('training-routine')
export class TrainingRoutineController {
  constructor(
    private readonly trainingRoutineService: TrainingRoutineService,
    private readonly trainingRoutineViewService: TrainingRoutineViewService,
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
  ) {
    const trainingRoutine =
      await this.trainingRoutineService.getTrainingRoutineByUserAndRoutineId(
        userId,
        trainingRoutineId,
      );
    return { title: trainingRoutine.title };
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

  @Post()
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
  async startTrainingSession(
    @GetUser() userId: string,
    @Param('id') trainingRoutineId: string,
  ) {
    return await this.trainingRoutineViewService.startTrainingRoutine(
      userId,
      trainingRoutineId,
    );
  }

  @Get('/:id/latest-version')
  async getLatestVersionOfSession(
    @GetUser() userId: string,
    @Param('id') trainingRoutineId: string,
  ) {
    const trainingRoutine =
      await this.trainingRoutineViewService.findTrainingRoutineOrFail(
        userId,
        trainingRoutineId,
      );

    return trainingRoutine.versions.length;
  }

  @Get('/:id/:version')
  async getTrainingSessionByVersion(
    @GetUser() userId: string,
    @Param('id') trainingRoutineId: string,
    @Param('version', ParseIntPipe) version: number,
  ) {
    return await this.trainingRoutineViewService.getTrainingSessionByVersion(
      userId,
      trainingRoutineId,
      version,
    );
  }

  @Patch('/:id/:version')
  async updateTrainingSessionVersion(
    @GetUser() userId: string,
    @Param('id') trainingRoutineId: string,
    @Param('version', ParseIntPipe) versionNumber: number,
    @Body() requestBody: ApiData,
  ) {
    return await this.trainingRoutineViewService.updateTrainingSessionVersion(
      userId,
      trainingRoutineId,
      versionNumber,
      requestBody,
    );
  }
}
