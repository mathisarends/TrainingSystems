import { NgClass } from '@angular/common';
import { Component, HostBinding, HostListener, signal } from '@angular/core';
import { IconName } from '../../icon/icon-name';
import { IconComponent } from '../../icon/icon.component';

@Component({
  selector: 'app-switch',
  standalone: true,
  imports: [IconComponent, NgClass],
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.scss'],
})
export class SwitchComponent {
  protected readonly IconName = IconName;
  isChecked = signal(false);

  @HostBinding('class.on')
  get isOn() {
    return this.isChecked();
  }

  @HostListener('click')
  toggle() {
    this.isChecked.set(!this.isChecked());
  }
}
