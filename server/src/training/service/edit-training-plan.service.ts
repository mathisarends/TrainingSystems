import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { EditTrainingPlanDto } from '../dto/edit-training-plan.dto';
import { TrainingPlanEditViewDto } from '../dto/training-plan-edit-view.dto';
import { TrainingDay } from '../model/training-day.schema';
import { TrainingPlan } from '../model/training-plan.model';
import { TrainingWeek } from '../model/training-week.schema';
import { TrainingService } from '../training.service';

@Injectable()
export class EditTrainingPlanService {
  constructor(private readonly trainingService: TrainingService) {}

  async getEditViewOfTrainingPlan(
    userId: string,
    trainingPlanId: string,
  ): Promise<TrainingPlanEditViewDto> {
    const trainingPlan = await this.trainingService.getPlanByUserAndTrainingId(
      userId,
      trainingPlanId,
    );

    return this.mapToEditViewDto(trainingPlan);
  }

  private mapToEditViewDto(
    trainingPlan: TrainingPlan,
  ): TrainingPlanEditViewDto {
    return {
      id: trainingPlan.id,
      title: trainingPlan.title,
      trainingDays: trainingPlan.trainingDays,
      weightRecommandationBase: trainingPlan.weightRecommandationBase,
      trainingBlockLength: trainingPlan.trainingWeeks.length,
      coverImageBase64: trainingPlan.coverImageBase64 || '',
      startDate: trainingPlan.startDate.toISOString(),
    };
  }

  /**
   * Edits an existing training plan based on the provided data.
   * Adjusts the training block length and training frequency as needed.
   */
  async editTrainingPlan(
    userId: string,
    trainingPlanId: string,
    editTrainingPlanDto: EditTrainingPlanDto,
  ) {
    const trainingPlan = await this.trainingService.getPlanByUserAndTrainingId(
      userId,
      trainingPlanId,
    );

    if (
      this.isBlockLengthChanged(
        trainingPlan,
        editTrainingPlanDto.trainingBlockLength,
      )
    ) {
      this.adjustBlockLength(
        trainingPlan,
        editTrainingPlanDto.trainingBlockLength,
        editTrainingPlanDto.trainingDays.length,
      );
    }

    if (
      this.isTrainingFrequencyChanged(
        trainingPlan,
        editTrainingPlanDto.trainingDays.length,
      )
    ) {
      this.handleTrainingFrequencyChange(
        trainingPlan,
        editTrainingPlanDto.trainingDays.length,
      );
    }

    return await this.trainingService.updateTrainingPlan(
      trainingPlan,
      editTrainingPlanDto,
    );
  }

  /**
   * Checks if the block length of a training plan has changed..
   */
  private isBlockLengthChanged(
    trainingPlan: TrainingPlan,
    newBlockLength: number,
  ) {
    return trainingPlan.trainingWeeks.length !== newBlockLength;
  }

  /**
   * Adjusts the block length of a training plan by adding or removing weeks.
   */
  private adjustBlockLength(
    trainingPlan: TrainingPlan,
    newBlockLength: number,
    daysPerWeek: number,
  ): void {
    const currentLength = trainingPlan.trainingWeeks.length;

    if (newBlockLength > currentLength) {
      const weeksToAdd = newBlockLength - currentLength;
      trainingPlan.trainingWeeks.push(
        ...Array.from({ length: weeksToAdd }, () =>
          this.createNewTrainingWeek(daysPerWeek),
        ),
      );
    } else if (newBlockLength < currentLength) {
      trainingPlan.trainingWeeks.splice(newBlockLength);
    }
  }

  /**
   * Creates a new training week with the specified number of training days.
   */
  private createNewTrainingWeek(daysPerWeek: number): TrainingWeek {
    return {
      trainingDays: Array.from({ length: daysPerWeek }, () =>
        this.createEmptyTrainingDay(),
      ),
    } as TrainingWeek;
  }

  /**
   * Checks if the training frequency (number of training days per week) has changed.
   */
  private isTrainingFrequencyChanged(
    trainingPlan: TrainingPlan,
    newAmountOfDays: number,
  ): boolean {
    return (
      trainingPlan.trainingWeeks[0].trainingDays.length !== newAmountOfDays
    );
  }

  /**
   * Adjusts the number of training days in each week based on the difference between the current and new training frequency.
   */
  private handleTrainingFrequencyChange(
    trainingPlan: TrainingPlan,
    newAmountOfDays: number,
  ): void {
    const currentDays = trainingPlan.trainingWeeks[0].trainingDays.length;
    const difference = currentDays - newAmountOfDays;

    if (difference > 0) {
      // Remove days
      trainingPlan.trainingWeeks.forEach((week) => {
        week.trainingDays.splice(-difference);
      });
    } else {
      // Add days
      const numberOfDaysToAdd = Math.abs(difference);
      trainingPlan.trainingWeeks.forEach((week) => {
        week.trainingDays.push(
          ...Array.from({ length: numberOfDaysToAdd }, () =>
            this.createEmptyTrainingDay(),
          ),
        );
      });
    }
  }

  /**
   * Creates an empty training day with a unique ID and no exercises.
   */
  private createEmptyTrainingDay() {
    return {
      id: uuidv4(),
      exercises: [],
    } as TrainingDay;
  }
}
