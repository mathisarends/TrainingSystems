import { Component, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';

import { HeaderComponent } from './components/header/header.component';
import { ToastComponent } from './components/toast/toast.component';
import { ServiceWorkerService } from './service-worker.service';
import { BrowserCheckService } from './browser-check.service';
import { MobileService } from '../service/util/mobile.service';
import { RedirectService } from '../service/util/redirect.service';
import { SpinnerComponent } from './components/loaders/spinner/spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  providers: [RedirectService],
  imports: [RouterOutlet, HeaderComponent, ToastComponent, SpinnerComponent],
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

  /**
   * This method initializes the redirection service to start tracking the user's route navigation.
   * It also checks if the app is being viewed on a mobile device and attempts to redirect the user
   * to their last visited route if applicable.
   */
  ngOnInit(): void {
    if (!this.mobileService.isMobileView()) {
      return;
    }

    this.redirectService.initialize();
    this.redirectService.redirectToLastRoute();
  }
}
