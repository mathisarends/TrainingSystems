import { Controller } from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { UserBestPerformanceService } from './user-best-performance.service';

@Controller('user-best-performance')
export class UserBestPerformanceController {
  constructor(
    private readonly userBestPerformanceService: UserBestPerformanceService,
  ) {}

  async getExerciseRecordsByUserId(@GetUser() userId: string) {
    return await this.userBestPerformanceService.getExerciseRecordsByUserId(
      userId,
    );
  }
}
