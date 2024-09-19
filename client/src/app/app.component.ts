import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';

import { HeaderComponent } from './components/header/header.component';
import { LoadingProgressBarComponent } from './components/loaders/loading-progress-bar/loading-progress-bar.component';
import { MobileNavComponent } from './components/mobile-nav/mobile-nav.component';
import { AuthService } from './core/auth.service';
import { BrowserCheckService } from './core/browser-check.service';
import { RedirectService } from './core/redirect.service';
import { MobileHeaderComponent } from './features/mobile-header/mobile-header.component';
import { MobileDeviceDetectionService } from './platform/mobile-device-detection.service';
import { ServiceWorkerService } from './platform/service-worker.service';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';
import { ToastComponent } from './shared/components/toast/toast.component';

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
    MobileHeaderComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'TrainingSystems';

  constructor(
    private serviceWorkerService: ServiceWorkerService,
    private browserCheckService: BrowserCheckService,
    private mobileDeviceDetectionService: MobileDeviceDetectionService,
    private redirectService: RedirectService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params['login'] === 'success' && this.authService.checkTempAuthCookie()) {
        this.authService.setAuthenticationStatus(true);
      }
    });

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
