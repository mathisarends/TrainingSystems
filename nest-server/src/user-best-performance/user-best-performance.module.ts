import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserExerciseRecord,
  UserExerciseRecordSchema,
} from './model/user-best-performance.model';
import { UserBestPerformanceController } from './user-best-performance.controller';
import { UserBestPerformanceService } from './user-best-performance.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserExerciseRecord.name, schema: UserExerciseRecordSchema },
    ]),
  ],
  controllers: [UserBestPerformanceController],
  providers: [UserBestPerformanceService],
  exports: [MongooseModule, UserBestPerformanceService],
})
export class UserExerciseRecordModule {}
