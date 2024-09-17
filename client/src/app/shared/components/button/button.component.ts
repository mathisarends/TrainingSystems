import { Component, HostListener, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  /**
   * Enum-like variant input that controls the button style.
   * Accepts 'PRIMARY' or 'SECONDARY'. Defaults to 'PRIMARY'.
   */
  variant = input<'PRIMARY' | 'SECONDARY' | 'DESTRUCTIVE'>('PRIMARY');

  /**
   * The text content displayed inside the button.
   * This input is required.
   */
  textContent = input.required<string>();

  /**
   * Emits an event when the button is clicked.
   */
  clicked = output<void>();

  /**
   * Listens for the `click` event on the button's host element and emits the `clicked` output.
   */
  @HostListener('click')
  onClick(): void {
    this.clicked.emit();
  }
}
