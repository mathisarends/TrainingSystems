import { Component } from '@angular/core';
import { SkeletonComponent } from '../../../../skeleton/skeleton.component';
import { SkeletonAnimationStyle } from '../../../../skeleton/skeleton-animation-style';

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
