import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { RedirectService } from './core/services/redirect.service';
import { HeaderComponent } from './features/header/header.component';
import { ProfileService } from './features/profile-2/service/profileService';
import { RestPauseTimeIndicatorComponent } from './features/training-plans/training-view/rest-pause-time-indicator/rest-pause-time-indicator.component';
import { PauseTimeService } from './features/training-plans/training-view/services/pause-time.service';
import { MobileDeviceDetectionService } from './platform/mobile-device-detection.service';
import { ServiceWorkerService } from './platform/service-worker.service';
import { NavBarComponent } from './shared/components/nav-bar/nav-bar.component';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { NotificationService } from './shared/service/notification.service';
import { WebSocketService } from './shared/service/webSocket/web-socket.service';

@Component({
  selector: 'app-root',
  standalone: true,
  providers: [RedirectService],
  imports: [
    RouterOutlet,
    ToastComponent,
    SpinnerComponent,
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
    protected pauseTimeService: PauseTimeService,
    private serviceWorkerService: ServiceWorkerService,
    private mobileDeviceDetectionService: MobileDeviceDetectionService,
    private redirectService: RedirectService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private profileService: ProfileService,
    private notificationService: NotificationService,
    private webSocketService: WebSocketService,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      if (params['login'] === 'success' && this.authService.checkTempAuthCookie()) {
        this.authService.setAuthenticationStatus(true);
      }
    });

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
