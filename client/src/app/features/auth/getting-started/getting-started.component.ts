import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HttpService } from '../../../core/services/http-client.service';
import { ModalOptionsBuilder } from '../../../core/services/modal/modal-options-builder';
import { ModalService } from '../../../core/services/modal/modal.service';
import { BasicConfirmationResponse } from '../../../shared/dto/basic-confirmation-response';
import { IconComponent } from '../../../shared/icon/icon.component';
import { HeaderService } from '../../header/header.service';
import { SetHeadlineInfo } from '../../header/set-headline-info';
import { PulsatingCircleComponent } from '../components/pulsating-circle.componen';
import { LoginModalComponent } from '../login-modal/login-modal.component';

declare const google: any;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [IconComponent, PulsatingCircleComponent],
  templateUrl: './getting-started.component.html',
  styleUrls: ['./getting-started.component.scss'],
})
export class GettingStartedComponent implements OnInit, SetHeadlineInfo {
  @ViewChild('googleLoginButton') googleLoginButton!: ElementRef;

  private document = inject(DOCUMENT);
  private static isGoogleScriptLoaded = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private httpService: HttpService,
    private modalService: ModalService,
    private headerService: HeaderService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.setHeadlineInfo();

    if (!GettingStartedComponent.isGoogleScriptLoaded) {
      await this.loadGoogleClientScript();
      GettingStartedComponent.isGoogleScriptLoaded = true;
    }

    // Initialize Google login if the script loaded successfully
    this.initializeGoogleLogin();
  }

  setHeadlineInfo(): void {
    this.headerService.setHeadlineInfo({ title: 'Start' });
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
    if (typeof google === 'undefined') {
      console.error('Google object is not defined. Make sure the script is loaded properly.');
      return;
    }

    google.accounts.id.initialize({
      client_id: '745778541640-0f05iimgfid2tag6rkvilau5nqt69ko0.apps.googleusercontent.com',
      use_fedcm_for_prompt: false,
      callback: (response: any) => this.handleCredentialResponse(response),
    });
  }

  protected triggerGoogleLogin() {
    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed()) {
        const modalOptions = new ModalOptionsBuilder()
          .setComponent(LoginModalComponent)
          .setTitle('Google Login')
          .setHasFooter(true)
          .build();

        this.modalService.open(modalOptions);
      }
    });
  }

  private handleCredentialResponse(response: any) {
    this.httpService
      .post<BasicConfirmationResponse>('/auth/login/oauth2', {
        credential: response.credential,
      })
      .subscribe((response) => {
        this.authService.setAuthenticated(true);
        this.router.navigate(['/']);
      });
  }
}
