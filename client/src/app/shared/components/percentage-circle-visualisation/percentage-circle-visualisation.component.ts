import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  HostListener,
  Injector,
  input,
  output,
  signal,
  ViewChild,
} from '@angular/core';
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

  percentageChanged = output<Percentage>();

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

  isDragging = signal(false);

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

  // Mouse down event to start dragging
  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    this.isDragging.set(true);
    this.updatePercentageFromEvent(event);
  }

  // Mouse move event to update progress while dragging
  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isDragging()) {
      this.updatePercentageFromEvent(event);
    }
  }

  // Calculate the percentage based on mouse position
  private updatePercentageFromEvent(event: MouseEvent) {
    const rect = this.progressRing.nativeElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate the angle between the center of the circle and the mouse position
    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

    // Convert angle to percentage (normalize the angle from -180 to 180 into 0 to 100%)
    angle = (angle + 90) % 360;
    if (angle < 0) angle += 360;

    const newPercentage = ((angle / 360) * 100) as Percentage;
    this.percentageChanged.emit(newPercentage);
  }
}
