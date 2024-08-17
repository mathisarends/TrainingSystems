import { Component, input } from '@angular/core';

@Component({
  selector: 'app-exercise-table-skeleton',
  standalone: true,
  imports: [],
  templateUrl: './exercise-table-skeleton.component.html',
  styleUrl: './exercise-table-skeleton.component.scss',
})
export class ExerciseTableSkeletonComponent {
  protected Array: any;

  amountOfTables = input<number>(5);
}
