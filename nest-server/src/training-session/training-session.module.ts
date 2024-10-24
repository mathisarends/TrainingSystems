import { Module } from '@nestjs/common';
import { TrainingSessionController } from './training-session.controller';
import { TrainingSessionService } from './training-session.service';

@Module({
  controllers: [TrainingSessionController],
  providers: [TrainingSessionService]
})
export class TrainingSessionModule {}
