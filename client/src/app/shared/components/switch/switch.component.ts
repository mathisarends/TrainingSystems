import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { IconName } from '../../icon/icon-name';
import { IconComponent } from '../../icon/icon.component';

@Component({
  selector: 'app-switch',
  standalone: true,
  imports: [IconComponent, NgClass],
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchComponent {
  protected readonly IconName = IconName;
  isChecked = model(false);

  protected toggle() {
    this.isChecked.set(!this.isChecked());
  }
}
