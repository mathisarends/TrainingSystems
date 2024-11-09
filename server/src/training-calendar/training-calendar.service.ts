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
              plan.trainingDays,
            );
            return {
              dayId: day.id,
              label: `W${weekIndex + 1}D${dayIndex + 1}`,
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
              plan.trainingDays,
            );
            return {
              dayId: day.id,
              label: `W${weekIndex + 1}D${dayIndex + 1}`,
              trainingDate,
              endTime: day.endTime,
            };
          }),
        ),
      )
      .filter((day) => !day.endTime);

    return {
      finishedTrainings: finishedTrainings.map(
        ({ dayId, label, trainingDate }) => ({
          dayId,
          label,
          trainingDate,
        }),
      ),
      upComingTrainings: upComingTrainings.map(
        ({ dayId, label, trainingDate }) => ({
          dayId,
          label,
          trainingDate,
        }),
      ),
    };
  }

  private calculateTrainingDate(
    startDate: Date,
    weekIndex: number,
    dayIndex: number,
    trainingDays: string[],
  ): Date {
    const dayMap = {
      Mo: 0,
      Di: 1,
      Mi: 2,
      Do: 3,
      Fr: 4,
      Sa: 5,
      So: 6,
    };

    // Indizes der Trainingstage (z. B. [0, 2, 4] für Mo, Mi, Fr)
    const trainingDayIndices = trainingDays.map((day) => dayMap[day]);

    trainingDayIndices.sort((a, b) => a - b);

    const firstDayOfWeek = new Date(startDate);
    firstDayOfWeek.setDate(startDate.getDate() + weekIndex * 7);

    let trainingDate = new Date(firstDayOfWeek);
    const numTrainingDays = trainingDayIndices.length;

    const offsetIndex = dayIndex % numTrainingDays;
    const fullWeeksOffset = Math.floor(dayIndex / numTrainingDays) * 7;

    trainingDate.setDate(
      firstDayOfWeek.getDate() +
        fullWeeksOffset +
        trainingDayIndices[offsetIndex],
    );

    return trainingDate;
  }
}
