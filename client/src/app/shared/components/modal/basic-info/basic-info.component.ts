import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-basic-info',
  standalone: true,
  imports: [],
  template: `{{ infoText() }}`,
  styleUrl: './basic-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicInfoComponent {
  infoText = signal('');
}
