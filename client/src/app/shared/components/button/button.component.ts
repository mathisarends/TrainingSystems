import { CommonModule } from '@angular/common';
import { Component, HostListener, input, output } from '@angular/core';
import { ModalValidationService } from '../modal/modal-validation.service';
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
   * Indicates whether the button is in a loading state.
   */
  isLoading = input(false);

  /**
   * The text content displayed inside the button.
   * This input is required.
   */
  textContent = input.required<string>();

  /**
   * Emits an event when the button is clicked.
   */
  clicked = output<Event>();

  /**
   * Indicates whether the button is disabled.
   * If true, the button will not emit click events and will invoke form validation instead.
   */
  disabled = input(false);

  constructor(private modalValidationService: ModalValidationService) {}

  /**
   * Handles the click event on the button.
   * If the button is disabled, prevents the default action and triggers form validation.
   * Otherwise, emits the click event.
   *
   * @param event - The click event object.
   */
  @HostListener('click', ['$event'])
  onClick(event: Event) {
    if (this.disabled()) {
      event.preventDefault();
      this.modalValidationService.triggerFormValidation();
      return;
    }

    this.clicked.emit(event);
  }
}
