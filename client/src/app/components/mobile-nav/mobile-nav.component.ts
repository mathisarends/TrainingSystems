import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IconName } from '../../shared/icon/icon-name';
import { IconComponent } from '../../shared/icon/icon.component';
import { RouteWatcherService } from '../../shared/service/route-watcher.service';

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

  constructor(
    private router: Router,
    protected routeWatcherService: RouteWatcherService,
  ) {}

  setActive(item: string): void {
    this.activeItem = item;

    if (item === 'home') {
      this.router.navigate(['']);
    } else if (item === 'profile') {
      this.router.navigate(['profile']);
    } else if (item === 'statistics') {
      this.router.navigate(['usage']);
    } else if (item === 'exercises') {
      this.router.navigate(['exercises']);
    }
  }
}
