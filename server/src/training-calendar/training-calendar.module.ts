import { Module } from '@nestjs/common';
import { TrainingCalendarController } from './training-calendar.controller';
import { TrainingCalendarService } from './training-calendar.service';

@Module({
  controllers: [TrainingCalendarController],
  providers: [TrainingCalendarService]
})
export class TrainingCalendarModule {}
