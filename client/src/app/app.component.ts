import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from './components/header/header.component';
import { ToastComponent } from './components/toast/toast.component';
import { ServiceWorkerService } from './service-worker.service';
import { BrowserCheckService } from './browser-check.service';
import { MobileDeviceDetectionService } from './core/mobile-device-detection.service';
import { RedirectService } from './core/redirect.service';
import { SpinnerComponent } from './components/loaders/spinner/spinner.component';
import { LoadingProgressBarComponent } from './components/loaders/loading-progress-bar/loading-progress-bar.component';
import { AuthService } from './core/auth.service';
import { MobileNavComponent } from './components/mobile-nav/mobile-nav.component';

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
  ) {
    if (this.browserCheckService.isBrowser()) {
      this.serviceWorkerService.registerServiceWorker();

      // called to prevent ts-warnings
      this.authService.checkAuthenticationStatus().subscribe();

      if (!this.mobileDeviceDetectionService.isMobileDevice) {
        return;
      }

      this.redirectService.initialize();
      this.redirectService.redirectToLastRoute();
    }
  }
}
