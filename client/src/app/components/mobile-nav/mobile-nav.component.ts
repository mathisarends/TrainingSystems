import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IconName } from '../../shared/icon/icon-name';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './mobile-nav.component.html',
  styleUrl: './mobile-nav.component.scss',
})
export class MobileNavComponent {
  protected IconName = IconName;

  protected activeItem: string = 'home';

  constructor(private router: Router) {}

  // Method to set the active item
  setActive(item: string): void {
    this.activeItem = item;

    if (item === 'home') {
      this.router.navigate(['']);
    } else if (item === 'profile') {
      this.router.navigate(['profile']);
    } else if (item === 'statistics') {
      this.router.navigate(['user/usage']);
    }
  }
}
