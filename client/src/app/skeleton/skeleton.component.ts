import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonAnimationStyle } from './skeleton-animation-style';

/**
 * @description
 * Component designed to display a skeleton loading placeholder.
 *
 * This component is particularly useful for indicating loading states while data is being fetched or processed.
 */
@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss'],
})
export class SkeletonComponent {
  /**
   * @description
   * Sets the width of the skeleton loader.
   * Accepts any valid CSS width value (e.g., `100%`, `150px`).
   *
   * @default '100%'
   */
  width = input<string>('100%');

  /**
   * @description
   * Sets the height of the skeleton loader.
   * Accepts any valid CSS height value (e.g., `1.75rem`, `20px`).
   */
  height = input<string>('1.75rem');

  /**
   * @description
   * Determines whether the Skeleton should be displayed in a circular fashion.
   */
  isCircular = input<boolean>(false);

  /**
   * @description
   * Sets the Animation style of the skeleton loader
   */
  animationStyle = input<SkeletonAnimationStyle>(SkeletonAnimationStyle.LOADING);
}
