import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-info',
  standalone: true,
  template: `{{ infoText() }}`,
  styleUrls: ['./info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoComponent {
  infoText = input.required<string>();
}
