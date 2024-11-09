import { Injectable } from '@nestjs/common';
import { TrainingService } from 'src/training/training.service';

@Injectable()
export class TrainingCalendarService {
  constructor(private readonly trainingService: TrainingService) {}

  async getCalendarDataForUser(userId: string) {
    const trainingPlans =
      await this.trainingService.getTrainingPlansByUser(userId);

    const currentDate = new Date();

    const finishedTrainings = trainingPlans
      .flatMap((plan) =>
        plan.trainingWeeks.flatMap((week, weekIndex) =>
          week.trainingDays.map((day, dayIndex) => {
            const trainingDate = this.calculateTrainingDate(
              plan.startDate,
              weekIndex,
              dayIndex,
            );
            return {
              dayId: day.id,
              position: `W${weekIndex + 1}D${dayIndex + 1}`,
              trainingDate,
              endTime: day.endTime,
            };
          }),
        ),
      )
      .filter(
        (day) => day.endTime && day.endTime.getTime() <= currentDate.getTime(),
      );

    const upComingTrainings = trainingPlans
      .flatMap((plan) =>
        plan.trainingWeeks.flatMap((week, weekIndex) =>
          week.trainingDays.map((day, dayIndex) => {
            const trainingDate = this.calculateTrainingDate(
              plan.startDate,
              weekIndex,
              dayIndex,
            );
            return {
              dayId: day.id,
              position: `W${weekIndex + 1}D${dayIndex + 1}`,
              trainingDate,
              endTime: day.endTime,
            };
          }),
        ),
      )
      .filter((day) => !day.endTime);

    return {
      finishedTrainings: finishedTrainings.map(
        ({ dayId, position, trainingDate }) => ({
          dayId,
          position,
          trainingDate,
        }),
      ),
      upComingTrainings: upComingTrainings.map(
        ({ dayId, position, trainingDate }) => ({
          dayId,
          position,
          trainingDate,
        }),
      ),
    };
  }

  private calculateTrainingDate(
    startDate: Date,
    weekIndex: number,
    dayIndex: number,
  ): Date {
    const trainingDate = new Date(startDate);
    trainingDate.setDate(startDate.getDate() + weekIndex * 7 + dayIndex);
    return trainingDate;
  }
}
