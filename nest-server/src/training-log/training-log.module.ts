import { Module } from '@nestjs/common';
import { TrainingModule } from 'src/training/training.module';
import { TrainingService } from 'src/training/training.service';
import { TrainingDayService } from './training-day.service';
import { TrainingLogController } from './training-log.controller';
import { TrainingLogService } from './training-log.service';

@Module({
  imports: [TrainingModule],
  controllers: [TrainingLogController],
  providers: [TrainingLogService, TrainingDayService, TrainingService],
})
export class TrainingLogModule {}
