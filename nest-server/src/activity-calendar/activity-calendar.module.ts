import { Module } from '@nestjs/common';
import { ActivityCalendarController } from './activity-calendar.controller';
import { ActivityCalendarService } from './activity-calendar.service';

@Module({
  controllers: [ActivityCalendarController],
  providers: [ActivityCalendarService]
})
export class ActivityCalendarModule {}
