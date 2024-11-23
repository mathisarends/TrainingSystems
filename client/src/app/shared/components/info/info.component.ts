import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconName } from '../../icon/icon-name';
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
  protected readonly IconName = IconName;

  infoText = input.required<string>();
}
