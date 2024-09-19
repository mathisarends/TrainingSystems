import { Component, input } from '@angular/core';
import { LoadingService } from '../../../core/loading.service';
import { SkeletonComponent } from '../skeleton/skeleton.component';

@Component({
  selector: 'app-headline',
  standalone: true,
  imports: [SkeletonComponent],
  templateUrl: './headline.component.html',
  styleUrl: './headline.component.scss',
})
export class HeadlineComponent {
  heading = input.required<string>();
  subHeading = input<string>('');

  constructor(protected loadingService: LoadingService) {}
}
