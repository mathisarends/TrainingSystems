import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserBestPerformance,
  UserBestPerformanceSchema
} from './model/user-best-performance.model';
import { UserBestPerformanceController } from './user-best-performance.controller';
import { UserBestPerformanceService } from './user-best-performance.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserBestPerformance.name, schema: UserBestPerformanceSchema },
    ]),
  ],
  controllers: [UserBestPerformanceController],
  providers: [UserBestPerformanceService],
  exports: [MongooseModule, UserBestPerformanceService],
})
export class UserExerciseRecordModule {}
