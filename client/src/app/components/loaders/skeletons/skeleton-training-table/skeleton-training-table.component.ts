import { Component } from '@angular/core';
import { SkeletonComponent } from '../../../../skeleton/skeleton.component';
import { SkeletonAnimationStyle } from '../../../../skeleton/skeleton-animation-style';

@Component({
  selector: 'app-skeleton-training-table',
  standalone: true,
  imports: [SkeletonComponent],
  templateUrl: './skeleton-training-table.component.html',
  styleUrl: './skeleton-training-table.component.scss',
})
export class SkeletonTrainingTableComponent {
  protected readonly PULSE = SkeletonAnimationStyle.PULSE;
}
