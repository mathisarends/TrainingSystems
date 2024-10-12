import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { BrowserCheckService } from './core/services/browser-check.service';
import { RedirectService } from './core/services/redirect.service';
import { HeaderComponent } from './features/header/header.component';
import { ProfileService } from './features/profile-2/service/profileService';
import { RestPauseTimeIndicatorComponent } from './features/training-plans/training-view/rest-pause-time-indicator/rest-pause-time-indicator.component';
import { MobileDeviceDetectionService } from './platform/mobile-device-detection.service';
import { ServiceWorkerService } from './platform/service-worker.service';
import { LoadingProgressBarComponent } from './shared/components/loader/loading-progress-bar/loading-progress-bar.component';
import { NavBarComponent } from './shared/components/nav-bar/nav-bar.component';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { NotificationService } from './shared/service/notification.service';

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
    RestPauseTimeIndicatorComponent,
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
    private notificationService: NotificationService,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      if (params['login'] === 'success' && this.authService.checkTempAuthCookie()) {
        this.authService.setAuthenticationStatus(true);
      }
    });

    if (this.browserCheckService.isBrowser()) {
      this.serviceWorkerService.registerServiceWorker();

      this.authService.checkAuthenticationStatus().subscribe();

      this.profileService.fetchAndSetProfileData().subscribe();

      this.notificationService.fetchAndSetTrainingDayNotifications().subscribe();

      if (!this.mobileDeviceDetectionService.isMobileDevice) {
        return;
      }

      this.redirectService.initialize();
      this.redirectService.redirectToLastRoute();
    }
  }
}
