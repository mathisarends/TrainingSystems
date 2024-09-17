import { Component, input } from '@angular/core';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-exercise-table-skeleton',
  standalone: true,
  imports: [SkeletonComponent],
  templateUrl: './exercise-table-skeleton.component.html',
  styleUrl: './exercise-table-skeleton.component.scss',
})
export class ExerciseTableSkeletonComponent {
  protected Array: any;

  amountOfTables = input<number>(5);
}
