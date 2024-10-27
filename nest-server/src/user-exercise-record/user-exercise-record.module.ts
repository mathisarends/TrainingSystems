import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserExerciseRecord,
  UserExerciseRecordSchema,
} from './model/user-exercise-record.model';
import { UserExerciseRecordController } from './user-exercise-record.controller';
import { UserExerciseRecordService } from './user-exercise-record.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserExerciseRecord.name, schema: UserExerciseRecordSchema },
    ]),
  ],
  controllers: [UserExerciseRecordController],
  providers: [UserExerciseRecordService],
  exports: [MongooseModule, UserExerciseRecordService],
})
export class UserExerciseRecordModule {}
