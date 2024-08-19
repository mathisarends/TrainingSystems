import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';

import { HeaderComponent } from './components/header/header.component';
import { ToastComponent } from './components/toast/toast.component';
import { ServiceWorkerService } from './service-worker.service';
import { BrowserCheckService } from './browser-check.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'TrainingSystems';

  constructor(
    private serviceWorkerService: ServiceWorkerService,
    private browserCheckService: BrowserCheckService,
    private router: Router,
  ) {
    if (this.browserCheckService.isBrowser()) {
      this.serviceWorkerService.registerServiceWorker();
    }
  }

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (this.browserCheckService.isBrowser() && event instanceof NavigationEnd) {
        // Save the last route in localStorage
        localStorage.setItem('lastRoute', event.urlAfterRedirects);
      }
    });

    const lastRoute = localStorage.getItem('lastRoute');
    if (lastRoute) {
      this.router.navigateByUrl(lastRoute);
    }
  }
}
