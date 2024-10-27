import { Module } from '@nestjs/common';
import { PushNotificationsModule } from 'src/push-notifications/push-notifications.module';
import { PushNotificationsService } from 'src/push-notifications/push-notifications.service';
import { RestTimerKeepAliveService } from './rest-timer-keep-alive.service';
import { TrainingTimerController } from './training-timer.controller';

@Module({
  imports: [PushNotificationsModule],
  controllers: [TrainingTimerController],
  providers: [RestTimerKeepAliveService, PushNotificationsService],
})
export class TrainingPlanTimerModule {}
