import { CommonModule } from '@angular/common';
import { Component, HostListener, input, output } from '@angular/core';
import { IconName } from '../../icon/icon-name';
import { IconComponent } from '../../icon/icon.component';
import { IconListItem } from './icon-list-item';

@Component({
  standalone: true,
  imports: [IconComponent, CommonModule],
  selector: 'app-profile-list-item',
  templateUrl: './icon-list-item.component.html',
  styleUrl: './icon-list-item.component.scss',
})
export class IconListeItemComponent {
  protected readonly IconName = IconName;

  item = input.required<IconListItem>();

  itemClicked = output<IconListItem>();

  constructor() {}

  @HostListener('click')
  onClick() {
    this.itemClicked.emit(this.item());
  }
}
