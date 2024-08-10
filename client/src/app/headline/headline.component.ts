import { Component, input } from '@angular/core';

@Component({
  selector: 'app-headline',
  standalone: true,
  imports: [],
  templateUrl: './headline.component.html',
  styleUrl: './headline.component.scss',
})
export class HeadlineComponent {
  heading = input.required<string>();
  subHeading = input<string>('');
}
