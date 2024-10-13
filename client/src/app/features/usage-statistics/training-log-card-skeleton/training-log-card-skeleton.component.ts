import { Component } from '@angular/core';
import { SkeletonAnimationStyle } from '../../../shared/components/skeleton/skeleton-animation-style';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  standalone: true,
  imports: [SkeletonComponent],
  selector: 'app-training-log-card-skeleton',
  templateUrl: './training-log-card-skeleton.component.html',
  styleUrls: ['./training-log-card-skeleton.component.scss'],
})
export class TrainingLogCardSkeletonComponent {
  protected readonly pulse = SkeletonAnimationStyle.PULSE;
}
