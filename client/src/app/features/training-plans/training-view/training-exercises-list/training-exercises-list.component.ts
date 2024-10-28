// training-exercises-list.component.ts
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { FormService } from '../../../../core/services/form.service';
import { TrainingDayLocatorService } from '../services/training-day-locator.service';
import { TrainingPlanDataService } from '../services/training-plan-data.service';

@Component({
  selector: 'app-training-exercises-list',
  standalone: true,
  imports: [CdkDropList, CdkDrag],
  templateUrl: './training-exercises-list.component.html',
  styleUrls: ['./training-exercises-list.component.scss'],
})
export class TrainingExercisesListComponent {
  constructor(
    protected trainingPlanDataService: TrainingPlanDataService,
    private trainingDayLocatorService: TrainingDayLocatorService,
    private formService: FormService,
  ) {}

  drop(event: CdkDragDrop<any[]>): void {
    const exercises = this.trainingPlanDataService.trainingDay.exercises!;

    console.log('🚀 ~ TrainingExercisesListComponent ~ drop ~ exercises before:', exercises);
    moveItemInArray(exercises, event.previousIndex, event.currentIndex);
    console.log('🚀 ~ TrainingExercisesListComponent ~ drop ~ exercises after:', exercises);

    this.trackExerciseChanges(event.previousIndex);
    this.trackExerciseChanges(event.currentIndex);
  }

  /**
   * Verfolgt Änderungen für die Übung am angegebenen Index.
   *
   * @param index Der Index der Übung im Array.
   */
  private trackExerciseChanges(index: number) {
    if (!this.trainingPlanDataService.trainingDay.exercises) {
      return;
    }

    const exercise = this.trainingPlanDataService.trainingDay.exercises[index];

    const namePrefix = `day${this.trainingDayLocatorService.trainingDayIndex}_exercise${index + 1}_`;

    const fields = ['category', 'exercise_name', 'sets', 'reps', 'weight', 'targetRPE', 'actualRPE', 'estMax', 'notes'];

    fields.forEach((field) => {
      this.formService.addChange(namePrefix + field, (exercise as any)[this.determineFieldName(field)]);
    });
  }

  private determineFieldName(fieldName: string): string {
    return fieldName !== 'exercise_name' ? fieldName : 'exercise';
  }
}
