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

  /**
   * The list item to be displayed.
   */
  item = input.required<IconListItem>();

  /**
   * An event emitter that emits the current `IconListItem` when the component
   * is clicked.
   */
  itemClicked = output<IconListItem>();

  /**
   * Handles the click event on the component. When the user clicks anywhere
   * on the component, this method is triggered, emitting the `itemClicked` event
   * with the current `IconListItem`.
   */
  @HostListener('click')
  onClick() {
    this.itemClicked.emit(this.item());
  }
}
