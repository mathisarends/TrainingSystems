import { CommonModule } from '@angular/common';
import { Component, HostListener, input, output } from '@angular/core';
import { ButtonLoaderComponent } from './button-loader/button-loader.component';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, ButtonLoaderComponent],
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

  clicked = output<Event>();

  @HostListener('click', ['$event'])
  onClick(event: Event) {
    this.clicked.emit(event);
  }
}
