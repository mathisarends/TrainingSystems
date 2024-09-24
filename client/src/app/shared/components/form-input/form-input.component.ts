import { Component, input, model, signal } from '@angular/core';

@Component({
  selector: 'app-form-input',
  standalone: true,
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.scss'],
})
export class FormInputComponent {
  value = model.required<string | number>();

  label = input<string>('');

  placeholder = input<string>('');

  isFocused = signal(false);

  onFocus(): void {
    this.isFocused.set(true);
  }

  onBlur(): void {
    this.isFocused.set(false);
  }
}
