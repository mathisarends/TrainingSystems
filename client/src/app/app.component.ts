import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';

import { HeaderComponent } from './components/header/header.component';
import { ToastComponent } from './components/toast/toast.component';
import { ServiceWorkerService } from './service-worker.service';
import { BrowserCheckService } from './browser-check.service';
import { MobileService } from '../service/util/mobile.service';
import { RedirectService } from '../service/util/redirect.service';

@Component({
  selector: 'app-root',
  standalone: true,
  providers: [RedirectService],
  imports: [RouterOutlet, HeaderComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'TrainingSystems';

  constructor(
    private serviceWorkerService: ServiceWorkerService,
    private browserCheckService: BrowserCheckService,
    private mobileService: MobileService,
    private redirectService: RedirectService,
  ) {
    if (this.browserCheckService.isBrowser()) {
      this.serviceWorkerService.registerServiceWorker();
    }
  }

  ngOnInit(): void {
    this.redirectService.initialize();

    if (this.mobileService.isMobileView()) {
      this.redirectService.redirectToLastRoute();
    }
  }
}
