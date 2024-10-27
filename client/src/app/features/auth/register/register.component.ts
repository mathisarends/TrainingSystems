import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HttpService } from '../../../core/services/http-client.service';
import { ModalService } from '../../../core/services/modal/modalService';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { BasicConfirmationResponse } from '../../../shared/dto/basic-confirmation-response';
import { IconComponent } from '../../../shared/icon/icon.component';
import { HeaderService } from '../../header/header.service';
import { PulsatingCircleComponent } from '../components/pulsating-circle.componen';
import { LoginModalComponent } from '../login-modal/login-modal.component';

declare const google: any;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [IconComponent, PulsatingCircleComponent],
  templateUrl: './register.component.html',
  styleUrls: ['../auth-shared.scss'],
})
export class RegisterComponent implements OnInit {
  @ViewChild('googleLoginButton') googleLoginButton!: ElementRef;

  private document = inject(DOCUMENT);
  private static isGoogleScriptLoaded = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private httpService: HttpService,
    private modalService: ModalService,
    private toastService: ToastService,
    private headerService: HeaderService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.headerService.setHeadlineInfo({ title: 'Start' });

    if (!RegisterComponent.isGoogleScriptLoaded) {
      await this.loadGoogleClientScript();
      RegisterComponent.isGoogleScriptLoaded = true;
    }

    // Initialize Google login if the script loaded successfully
    this.initializeGoogleLogin();
  }

  private loadGoogleClientScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const existingScript = this.document.getElementById('google-client-script');
      if (existingScript) {
        resolve();
        return;
      }

      const script = this.document.createElement('script');
      script.id = 'google-client-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Google script could not be loaded.'));
      this.document.head.appendChild(script);
    });
  }

  private initializeGoogleLogin() {
    google.accounts.id.initialize({
      client_id: '745778541640-0f05iimgfid2tag6rkvilau5nqt69ko0.apps.googleusercontent.com',
      use_fedcm_for_prompt: false,
      callback: (response: any) => this.handleCredentialResponse(response),
    });
  }

  protected triggerGoogleLogin() {
    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed()) {
        this.modalService.open({
          component: LoginModalComponent,
          title: 'Google Login',
          hasFooter: false,
        });
      }
    });
  }

  private handleCredentialResponse(response: any) {
    this.httpService
      .post<BasicConfirmationResponse>('/auth/login/oauth2', {
        credential: response.credential,
      })
      .subscribe((response) => {
        this.toastService.success(response.message);
        this.authService.setAuthenticated(true);
        this.router.navigate(['/']);
      });
  }
}
