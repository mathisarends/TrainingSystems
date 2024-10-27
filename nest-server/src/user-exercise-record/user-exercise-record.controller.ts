import { Controller } from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { UserExerciseRecordService } from './user-exercise-record.service';

@Controller('user-exercise-record')
export class UserExerciseRecordController {
  constructor(
    private readonly userExerciseRecordService: UserExerciseRecordService,
  ) {}

  async getExerciseRecordsByUserId(@GetUser() userId: string) {
    return await this.userExerciseRecordService.getExerciseRecordsByUserId(
      userId,
    );
  }
}
