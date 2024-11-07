import { Component, input } from '@angular/core';

@Component({
  selector: 'app-pulsating-circle',
  template: `{{ text() }}`,
  standalone: true,
  styleUrls: ['./pulsating-circle.component.scss'],
})
export class PulsatingCircleComponent {
  text = input.required<string>();
}
