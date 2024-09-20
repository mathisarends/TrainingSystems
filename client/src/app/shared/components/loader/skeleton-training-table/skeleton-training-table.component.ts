import { Component, signal } from '@angular/core';
import { SkeletonAnimationStyle } from '../../../../shared/components/skeleton/skeleton-animation-style';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-skeleton-training-table',
  standalone: true,
  imports: [SkeletonComponent],
  templateUrl: './skeleton-training-table.component.html',
  styleUrl: './skeleton-training-table.component.scss',
})
export class SkeletonTrainingTableComponent {
  /**
   *  Pulse animation style of skeletons.
   */
  protected readonly PULSE = SkeletonAnimationStyle.PULSE;

  /**
   * Signal representing the number of sections to generate.
   * The default value is set to 10.
   */
  protected sections = signal<number[]>(Array.from({ length: 10 }, (_, i) => i + 1));

  /**
   * Signal representing the number of rows per section to generate.
   * The default value is set to 9.
   */
  protected rowsPerSection = signal<number[]>(Array.from({ length: 9 }, (_, i) => i + 1));
}
