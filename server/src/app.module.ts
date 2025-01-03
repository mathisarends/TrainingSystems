import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { TrainingCalendarModule } from './training-calendar/training-calendar.module';
import { TrainingLogModule } from './training-log/training-log.module';
import { TrainingRoutineModule } from './training-routine/training-routine.module';
import { TrainingModule } from './training/training.module';
import { UserExerciseRecordModule } from './user-best-performance/user-best-performance.module';
import { UsersModule } from './users/users.module';
import { BodyWeightModule } from './body-weight/body-weight.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const environment = configService.get<string>('NODE_ENV') || 'development';
        const mongoUri =
          environment === 'development'
            ? configService.get<string>('MONGO_URI_DEV')
            : configService.get<string>('MONGO_URI_PROD');
        return {
          uri: mongoUri,
        };
      },
      inject: [ConfigService],
    }),
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
    TrainingCalendarModule,
    BodyWeightModule,
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
