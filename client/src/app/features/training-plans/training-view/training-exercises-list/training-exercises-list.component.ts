// training-exercises-list.component.ts
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { TrainingPlanDataService } from '../services/training-plan-data.service';

@Component({
  selector: 'app-training-exercises-list',
  standalone: true,
  imports: [CdkDropList, CdkDrag],
  templateUrl: './training-exercises-list.component.html',
  styleUrls: ['./training-exercises-list.component.scss'],
})
export class TrainingExercisesListComponent {
  constructor(protected trainingPlanDataService: TrainingPlanDataService) {}

  drop(event: CdkDragDrop<any[]>): void {
    const exercises = [...this.trainingPlanDataService.exercises()];

    moveItemInArray(exercises, event.previousIndex, event.currentIndex);

    this.trainingPlanDataService.exercises.set(exercises);
  }
}
