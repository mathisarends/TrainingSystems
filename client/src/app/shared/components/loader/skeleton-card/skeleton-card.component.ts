import { Component } from '@angular/core';
import { SkeletonAnimationStyle } from '../../../../shared/components/skeleton/skeleton-animation-style';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  imports: [SkeletonComponent],
  templateUrl: './skeleton-card.component.html',
  styleUrl: './skeleton-card.component.scss',
})
export class SkeletonCardComponent {
  protected readonly pulse = SkeletonAnimationStyle.PULSE;
}
