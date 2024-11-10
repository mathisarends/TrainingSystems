import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-basic-info',
  standalone: true,
  imports: [],
  template: `<div class="info-container">
    {{ text }}
  </div>`,
  styleUrl: './basic-info.component.scss',
})
export class BasicInfoComponent {
  @Input() text: string = '';
}
