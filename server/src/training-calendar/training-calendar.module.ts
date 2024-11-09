import { Module } from '@nestjs/common';
import { TrainingModule } from 'src/training/training.module';
import { TrainingService } from 'src/training/training.service';
import { TrainingCalendarController } from './training-calendar.controller';
import { TrainingCalendarService } from './training-calendar.service';

@Module({
  controllers: [TrainingCalendarController],
  imports: [TrainingModule],
  providers: [TrainingCalendarService, TrainingService],
})
export class TrainingCalendarModule {}
