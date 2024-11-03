import { Module } from '@nestjs/common';
import { TrainingModule } from 'src/training/training.module';
import { TrainingService } from 'src/training/training.service';
import { ActivityCalendarController } from './activity-calendar.controller';
import { ActivityCalendarService } from './activity-calendar.service';

@Module({
  imports: [TrainingModule],
  controllers: [ActivityCalendarController],
  providers: [ActivityCalendarService, TrainingService],
})
export class ActivityCalendarModule {}
