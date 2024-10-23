import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrainingModule } from 'src/training/training.module';
import { TrainingService } from 'src/training/training.service';
import {
  TrainingLogNotification,
  TrainingLogNotificationSchema,
} from './model/training-log.model';
import { TrainingDayService } from './training-day.service';
import { TrainingLogController } from './training-log.controller';
import { TrainingLogService } from './training-log.service';

@Module({
  imports: [
    TrainingModule,
    MongooseModule.forFeature([
      {
        name: TrainingLogNotification.name,
        schema: TrainingLogNotificationSchema,
      },
    ]),
  ],
  controllers: [TrainingLogController],
  providers: [TrainingLogService, TrainingDayService, TrainingService],
})
export class TrainingLogModule {}
