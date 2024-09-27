import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { MobileDeviceDetectionService } from '../../platform/mobile-device-detection.service';

@Directive({
  selector: '[appDraggable]',
  standalone: true,
})
export class DraggableDirective {
  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private initialX = 0;
  private initialY = 0;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private mobileDeviceDetectionService: MobileDeviceDetectionService,
  ) {}

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    if (this.mobileDeviceDetectionService.isMobileDevice) {
      return;
    }

    if (
      (event.target as HTMLElement).closest('.btn-close') ||
      (event.target as HTMLElement).closest('.modal-footer') ||
      (event.target as HTMLElement).closest('.modal-body')
    ) {
      return;
    }

    this.isDragging = true;
    this.startX = event.clientX;
    this.startY = event.clientY;

    const element = this.el.nativeElement;
    const rect = element.getBoundingClientRect();
    this.initialX = rect.left;
    this.initialY = rect.top;

    // Set the element to be positioned absolutely for dragging, but only after it's rendered
    this.renderer.setStyle(element, 'position', 'absolute');
    this.renderer.setStyle(element, 'left', `${this.initialX}px`);
    this.renderer.setStyle(element, 'width', `${rect.width}px`);
    this.renderer.setStyle(element, 'cursor', 'move');

    // Prevent text selection during dragging
    event.preventDefault();
  }

  // Mousemove event to handle the dragging
  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;

    const deltaX = event.clientX - this.startX;
    const deltaY = event.clientY - this.startY;

    let newX = this.initialX + deltaX;
    let newY = this.initialY + deltaY;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const element = this.el.nativeElement;
    const rect = element.getBoundingClientRect();

    const elementWidth = rect.width;
    const elementHeight = rect.height;

    if (newX < 0) {
      newX = 0;
    } else if (newX + elementWidth > windowWidth) {
      newX = windowWidth - elementWidth;
    }

    this.renderer.setStyle(element, 'left', `${newX}px`);
    this.renderer.setStyle(element, 'top', `${newY}px`);
  }

  // Mouseup event to stop dragging
  @HostListener('window:mouseup')
  onMouseUp(): void {
    this.isDragging = false;
    this.renderer.setStyle(this.el.nativeElement, 'cursor', 'default');
  }
}
