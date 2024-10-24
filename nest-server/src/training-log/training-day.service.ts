import { Injectable, NotFoundException } from '@nestjs/common';
import { TrainingDay } from 'src/training/model/training-day.schema';
import { TrainingPlan } from 'src/training/model/training-plan.model';
import { TrainingWeek } from 'src/training/model/training-week.schema';

@Injectable()
export class TrainingDayService {
  async findTrainingDayById(
    trainingPlans: TrainingPlan[],
    trainingDayId: string,
  ): Promise<TrainingDay> {
    for (const trainingPlan of trainingPlans) {
      const foundDay = this.findTrainingDayInPlan(trainingPlan, trainingDayId);
      if (foundDay) {
        return foundDay;
      }
    }
    throw new NotFoundException(
      `Trainingstag mit der id ${trainingDayId} konnte nicht gefunden werden.`,
    );
  }

  private findTrainingDayInPlan(
    trainingPlan: TrainingPlan,
    trainingDayId: string,
  ): TrainingDay | undefined {
    for (const trainingWeek of trainingPlan.trainingWeeks) {
      const foundDay = this.findTrainingDayInWeek(trainingWeek, trainingDayId);
      if (foundDay) {
        return foundDay;
      }
    }
    return undefined;
  }

  private findTrainingDayInWeek(
    trainingWeek: TrainingWeek,
    trainingDayId: string,
  ): TrainingDay | undefined {
    return trainingWeek.trainingDays.find((day) => day.id === trainingDayId);
  }
}
