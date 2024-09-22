import { Injectable, signal, WritableSignal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HeadlineService {
  title: WritableSignal<string> = signal('');
  subTitle: WritableSignal<string> = signal('');

  isTitleLoading: WritableSignal<boolean> = signal(false);

  constructor(private router: Router) {
    router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map((event: NavigationEnd) => event.url.replace(/^\/+/, '') || 'Training'),
      )
      .subscribe((url: string) => this.handleRouteChange(url));
  }

  private handleRouteChange(url: string) {
    if (url.includes('profile')) {
      this.title.set('profile');
    } else if (url.includes('usage')) {
      this.title.set('usage');
    } else if (url.includes('view') || url.includes('statistics')) {
      this.isTitleLoading.set(true);
      return;
    } else {
      this.title.set('Training');
    }

    this.subTitle.set('TYR');
  }
}
