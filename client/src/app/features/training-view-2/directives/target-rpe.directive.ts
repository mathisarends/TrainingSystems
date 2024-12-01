import { Directive, HostListener, Renderer2 } from '@angular/core';

/**
 * Directive that extends the AbstractDoubleClickDirective to add RPE input-specific functionality.
 */
@Directive({
  selector: '[targetRPE]',
  standalone: true,
})
export class TargetRpeDirective {
  private readonly MIN_RPE = 5;
  private readonly MAX_RPE = 10;

  constructor(private renderer: Renderer2) {}

  @HostListener('change', ['$event'])
  onChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let rpeValue = parseFloat(inputElement.value);

    if (isNaN(rpeValue)) {
      rpeValue = this.MIN_RPE;
    } else if (rpeValue < this.MIN_RPE) {
      rpeValue = this.MIN_RPE;
    } else if (rpeValue > this.MAX_RPE) {
      rpeValue = this.MAX_RPE;
    }

    this.renderer.setProperty(inputElement, 'value', rpeValue.toString());

    inputElement.dispatchEvent(new Event('change', { bubbles: true }));
  }
}
