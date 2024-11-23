import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../../icon/icon.component';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoComponent {
  infoText = input.required<string>();
}
