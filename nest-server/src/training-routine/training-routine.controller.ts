import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { CreateTrainingRoutineDto } from './dto/create-training-routine.dto';
import { EditTrainingRoutineDto } from './dto/edit-training-routine.dto';
import { TrainingRoutineService } from './training-routine.service';

@Controller('training-session')
export class TrainingRoutineController {
  constructor(
    private readonly trainingRoutineService: TrainingRoutineService,
  ) {}

  @Get('/')
  getTrainingSessionCardViews(@GetUser() userId: string) {}

  @Get('/title/:id')
  getTrainingSessionTitleById(
    @GetUser() userId: string,
    @Param('id') id: string,
  ) {}

  @Get('/:id')
  getTrainingSessionById(@GetUser() userId: string, @Param('id') id: string) {}

  @Post('/create')
  createTrainingSession(
    @GetUser() userId: string,
    @Body() createTrainingRoutineDto: CreateTrainingRoutineDto,
  ) {}

  @Put('/edit/:id')
  editTrainingSession(
    @GetUser() userId: string,
    @Param('id') id: string,
    @Body() editTrainingRoutineDto: EditTrainingRoutineDto,
  ) {}

  @Delete('/:id')
  deleteTrainingSession(@GetUser() userId: string, @Param('id') id: string) {}

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
