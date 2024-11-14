import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-basic-info',
  standalone: true,
  imports: [],
  template: `{{ text }}`,
  styleUrl: './basic-info.component.scss',
})
export class BasicInfoComponent {
  @Input() text: string = '';
}
