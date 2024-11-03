import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityCalendarModule } from './activity-calendar/activity-calendar.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { ExerciseModule } from './exercise/exercise.module';
import { FriendshipModule } from './friendship/friendship.module';
import { GymTicketModule } from './gym-ticket/gym-ticket.module';
import { RequestLoggerMiddleware } from './middleware/logger-middleware';
import { PushNotificationsModule } from './push-notifications/push-notifications.module';
import { TrainingLogModule } from './training-log/training-log.module';
import { TrainingRoutineModule } from './training-routine/training-routine.module';
import { TrainingModule } from './training/training.module';
import { UserExerciseRecordModule } from './user-best-performance/user-best-performance.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    UsersModule,
    AuthModule,
    ExerciseModule,
    GymTicketModule,
    PushNotificationsModule,
    PushNotificationsModule,
    TrainingModule,
    TrainingLogModule,
    ActivityCalendarModule,
    FriendshipModule,
    FriendshipModule,
    UserExerciseRecordModule,
    TrainingRoutineModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
