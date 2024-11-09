import { Module } from '@nestjs/common';
import { TrainingModule } from 'src/training/training.module';
import { TrainingService } from 'src/training/training.service';
import { TrainingCalendarController } from './training-calendar.controller';
import { TrainingCalendarService } from './training-calendar.service';
import { TrainingDayInfoService } from './training-day-info.service';

@Module({
  controllers: [TrainingCalendarController],
  imports: [TrainingModule],
  providers: [TrainingCalendarService, TrainingService, TrainingDayInfoService],
})
export class TrainingCalendarModule {}
