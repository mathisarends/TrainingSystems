import { AfterViewInit, Component, effect, ElementRef, Injector, input, ViewChild } from '@angular/core';
import { Percentage } from './percentage.type';

@Component({
  selector: 'app-percentage-circle-visualisation',
  standalone: true,
  imports: [],
  templateUrl: './percentage-circle-visualisation.component.html',
  styleUrls: ['./percentage-circle-visualisation.component.scss'],
})
export class PercentageCircleVisualisationComponent implements AfterViewInit {
  @ViewChild('progressRing') progressRing!: ElementRef;

  /**
   * The percentage value to visualize.
   * This is a required input and should be a valid percentage (0-100).
   */
  percentage = input.required<Percentage>();

  /**
   * The size of the visualized circle in pixels.
   * Default value is 100 if not provided.
   */
  size = input<number>(100);

  /**
   * Flag to show or hide the percentage text inside the circle.
   * Default is false, meaning the percentage text is hidden.
   */
  showPercentageText = input<boolean>(false);

  constructor(private injector: Injector) {}

  /**
   * Angular lifecycle hook that is called after the view has been initialized.
   * It calculates and applies the stroke dasharray and offset for the progress circle
   * based on the provided percentage.
   */
  ngAfterViewInit(): void {
    effect(
      () => {
        const circle = this.progressRing.nativeElement.querySelector('.progress-ring__circle');
        const radius = circle.r?.baseVal.value;

        const circumference = 2 * Math.PI * radius;

        let offset = (this.percentage() / 100) * circumference;

        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = `${offset}`;
      },
      { allowSignalWrites: true, injector: this.injector },
    );
  }
}
