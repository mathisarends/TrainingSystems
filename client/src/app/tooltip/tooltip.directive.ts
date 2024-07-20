import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective {
  @Input('appTooltip') tooltipMessage: string = '';
  tooltipElement!: HTMLElement;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter') onMouseEnter() {
    if (!this.tooltipElement) {
      this.tooltipElement = this.renderer.createElement('div');
      this.renderer.addClass(this.tooltipElement, 'tooltip-container');

      const arrow = this.renderer.createElement('div');
      this.renderer.addClass(arrow, 'tooltip-arrow');
      this.renderer.appendChild(this.tooltipElement, arrow);

      const text = this.renderer.createElement('span');
      this.renderer.addClass(text, 'tooltip-text');
      this.renderer.appendChild(
        text,
        this.renderer.createText(this.tooltipMessage)
      );
      this.renderer.appendChild(this.tooltipElement, text);

      this.renderer.appendChild(document.body, this.tooltipElement);
    }
    const rect = this.el.nativeElement.getBoundingClientRect();
    this.renderer.setStyle(
      this.tooltipElement,
      'top',
      `${rect.top + window.scrollY - this.tooltipElement.offsetHeight - 7.5}px`
    );
    this.renderer.setStyle(
      this.tooltipElement,
      'left',
      `${
        rect.left +
        window.scrollX +
        rect.width / 2 -
        this.tooltipElement.offsetWidth / 2
      }px`
    );
    this.renderer.setStyle(this.tooltipElement, 'visibility', 'visible');
    this.renderer.setStyle(this.tooltipElement, 'opacity', '1');
  }

  @HostListener('mouseleave') onMouseLeave() {
    if (this.tooltipElement) {
      this.renderer.setStyle(this.tooltipElement, 'visibility', 'hidden');
      this.renderer.setStyle(this.tooltipElement, 'opacity', '0');
    }
  }
}
