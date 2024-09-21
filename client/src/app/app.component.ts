import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { BrowserCheckService } from './core/services/browser-check.service';
import { RedirectService } from './core/services/redirect.service';
import { HeaderComponent } from './features/header/header.component';
import { ProfileService } from './features/profile/profileService';
import { MobileDeviceDetectionService } from './platform/mobile-device-detection.service';
import { ServiceWorkerService } from './platform/service-worker.service';
import { LoadingProgressBarComponent } from './shared/components/loader/loading-progress-bar/loading-progress-bar.component';
import { NavBarComponent } from './shared/components/nav-bar/nav-bar.component';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  providers: [RedirectService],
  imports: [
    RouterOutlet,
    ToastComponent,
    SpinnerComponent,
    LoadingProgressBarComponent,
    NavBarComponent,
    HeaderComponent,
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
    private profileService: ProfileService,
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

      this.profileService.getProfile().subscribe();

      if (!this.mobileDeviceDetectionService.isMobileDevice) {
        return;
      }

      this.redirectService.initialize();
      this.redirectService.redirectToLastRoute();
    }
  }
}
