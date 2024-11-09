import { Injectable, NotFoundException } from '@nestjs/common';
import { TrainingService } from 'src/training/training.service';

@Injectable()
export class TrainingDayInfoService {
  constructor(private readonly trainingService: TrainingService) {}

  async getTrainingDayInfo(
    userId: string,
    planId: string,
    weekIndex: number,
    dayIndex: number,
  ) {
    const trainingPlan = await this.trainingService.getPlanByUserAndTrainingId(
      userId,
      planId,
    );
    const trainingDay =
      trainingPlan.trainingWeeks[weekIndex].trainingDays[dayIndex];

    if (!trainingDay) {
      throw new NotFoundException(
        `The training day could not be found for weekIndex ${weekIndex} and dayIndex ${dayIndex}`,
      );
    }

    return trainingDay;
  }
}
