import { Component, input, model } from '@angular/core';

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
}
