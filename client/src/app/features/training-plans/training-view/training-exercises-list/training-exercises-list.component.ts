// training-exercises-list.component.ts
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
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

  protected drop(event: CdkDragDrop<string[]>) {
    console.log('some placeholder logic');
    /* moveItemInArray(this.movies, event.previousIndex, event.currentIndex); */
  }
}
