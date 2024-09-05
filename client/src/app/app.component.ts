import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from './components/header/header.component';
import { ToastComponent } from './components/toast/toast.component';
import { ServiceWorkerService } from './service-worker.service';
import { BrowserCheckService } from './browser-check.service';
import { MobileDeviceDetectionService } from '../service/mobile-device-detection.service';
import { RedirectService } from '../service/util/redirect.service';
import { SpinnerComponent } from './components/loaders/spinner/spinner.component';
import { LoadingProgressBarComponent } from './components/loaders/loading-progress-bar/loading-progress-bar.component';
import { MobileNavComponent } from './mobile-nav/mobile-nav.component';
import { AuthService } from '../service/auth.service';
import { UserDataService } from '../service/user-data-service/user-data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  providers: [RedirectService],
  imports: [
    RouterOutlet,
    HeaderComponent,
    ToastComponent,
    SpinnerComponent,
    LoadingProgressBarComponent,
    MobileNavComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'TrainingSystems';

  constructor(
    private serviceWorkerService: ServiceWorkerService,
    private browserCheckService: BrowserCheckService,
    private mobileDeviceDetectionService: MobileDeviceDetectionService,
    private redirectService: RedirectService,
    private authService: AuthService,
    private userDataService: UserDataService,
  ) {
    if (this.browserCheckService.isBrowser()) {
      this.serviceWorkerService.registerServiceWorker();

      if (!this.mobileDeviceDetectionService.isMobileDevice) {
        return;
      }

      this.authService.checkInitialAuthenticationStatus(); // called to prevent ts-warnings
      this.userDataService.fetchUserData();

      this.redirectService.initialize();
      this.redirectService.redirectToLastRoute();
    }
  }
}
