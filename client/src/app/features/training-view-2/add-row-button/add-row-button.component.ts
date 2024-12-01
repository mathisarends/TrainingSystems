import {
  ChangeDetectionStrategy,
  Component,
  effect,
  HostBinding,
  input,
  output,
  Renderer2,
  signal,
} from '@angular/core';
import { buttonVisibilityAnimation } from './button-visibility-animation';

@Component({
  selector: 'app-add-row-button',
  standalone: true,
  template: `@if (isVisible()) {
    <button (mousedown)="startDrag($event)" (click)="emitAddRow()">+</button>
  }`,
  styleUrls: ['./add-row-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [buttonVisibilityAnimation],
})
export class AddRowButtonComponent {
  isDragging = signal(false);

  /**
   * Controls an animation whether the button is visible via an animation. Only visible when user hovers over last table row.
   */
  isVisible = input(false);

  /**
   * Signal to store the initial Y-coordinate of the mouse when dragging starts.
   */
  initialMouseY = signal(0);

  /**
   * Signal to accumulate the total vertical movement of the mouse during dragging.
   */
  accumulatedDelta = signal(0);

  /**
   * Output signal to emit when a row should be added.
   */
  addRow = output<void>();

  /**
   * Output signal to emit when a row should be removed.
   */
  removeRow = output<void>();

  @HostBinding('class.visible') get isButtonVisible(): boolean {
    return this.isVisible();
  }

  @HostBinding('@buttonVisibility') get animationState(): 'visible' | 'hidden' {
    return this.isVisible() ? 'visible' : 'hidden';
  }

  constructor(private renderer: Renderer2) {
    effect(() => {
      const isDragging = this.isDragging();

      if (isDragging) {
        this.renderer.setStyle(document.body, 'cursor', 'row-resize');
      } else {
        this.renderer.removeStyle(document.body, 'cursor');
      }
    });
  }

  /**
   * Starts the dragging process by setting the initial mouse position,
   * resetting the accumulated delta, and adding global event listeners.
   *
   * @param event - The mousedown event that starts the drag.
   */
  startDrag(event: MouseEvent): void {
    this.isDragging.set(true);
    this.initialMouseY.set(event.clientY);
    this.accumulatedDelta.set(0);

    document.addEventListener('mousemove', this.onDrag);
    document.addEventListener('mouseup', this.stopDrag);
  }

  /**
   * Handles the dragging logic, calculating the difference in mouse Y-position,
   * and emitting signals to add or remove rows based on the total movement.
   *
   * @param event - The mousemove event triggered during dragging.
   */
  onDrag = (event: MouseEvent): void => {
    if (!this.isDragging()) return;

    const deltaY = event.clientY - this.initialMouseY();
    this.accumulatedDelta.update((current) => current + deltaY);
    this.initialMouseY.set(event.clientY);

    const rowHeight = 37;
    const rowsToChange = Math.floor(this.accumulatedDelta() / rowHeight);

    if (rowsToChange > 0) {
      this.addRow.emit();
      this.accumulatedDelta.update((current) => current - rowsToChange * rowHeight);
    } else if (rowsToChange < 0) {
      this.removeRow.emit();
      this.accumulatedDelta.update((current) => current - rowsToChange * rowHeight);
    }
  };

  /**
   * Stops the dragging process by resetting the dragging state
   * and removing global event listeners.
   */
  stopDrag = (): void => {
    if (this.isDragging()) {
      this.isDragging.set(false);

      document.removeEventListener('mousemove', this.onDrag);
      document.removeEventListener('mouseup', this.stopDrag);
    }
  };

  /**
   * Emits and add-row Event after a simple click.
   */
  emitAddRow(): void {
    this.addRow.emit();
  }
}
