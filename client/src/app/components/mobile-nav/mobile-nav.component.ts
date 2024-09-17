import { Component } from '@angular/core';
import { IconComponent } from '../../shared/icon/icon.component';
import { IconName } from '../../shared/icon/icon-name';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './mobile-nav.component.html',
  styleUrl: './mobile-nav.component.scss',
})
export class MobileNavComponent {
  protected IconName = IconName;
}
