import { Component, output } from '@angular/core';
import { IconName } from '../../icon/icon-name';
import { CircularIconButtonComponent } from '../circular-icon-button/circular-icon-button.component';

// TODO: diese komponente hier auch im Kalendar verwenden
@Component({
  selector: 'app-navigation-arrows',
  standalone: true,
  imports: [CircularIconButtonComponent],
  templateUrl: './navigation-arrows.component.html',
  styleUrls: ['./navigation-arrows.component.scss'],
})
export class NavigationArrowsComponent {
  protected readonly IconName = IconName;

  navigateLeft = output<void>();
  navigateRight = output<void>();

  onNavigateLeft(): void {
    this.navigateLeft.emit();
  }

  onNavigateRight(): void {
    this.navigateRight.emit();
  }
}
