import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

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
}
