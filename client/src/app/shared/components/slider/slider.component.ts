import { ChangeDetectionStrategy, Component, effect, ElementRef, input, model, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderComponent {
  /**
   * Reference to the slider element for DOM operations.
   */
  slider = viewChild<ElementRef>('slider');

  /**
   * Signal for the current slider value.
   */
  value = model<number>(50);

  /**
   * Signal for the minimum value of the slider.
   */
  min = input<number>(1);

  /**
   * Signal for the maximum value of the slider.
   */
  max = input<number>(100);

  /**
   * Signal to control the visibility of the numeric value.
   */
  showNumericValue = input(true);

  constructor() {
    effect(() => {
      const sliderElement = this.slider()?.nativeElement;
      if (sliderElement) {
        this.updateSliderBackground(sliderElement);
      }
    });
  }

  /**
   * Updates the slider's background based on the current value.
   * @param input - The HTMLInputElement of the slider
   */
  private updateSliderBackground(input: HTMLInputElement): void {
    const percentage = this.value();
    input.style.background = `linear-gradient(
      to right,
      var(--accent-color) ${percentage}%,
      #dddddd ${percentage}%
    )`;
  }
}
