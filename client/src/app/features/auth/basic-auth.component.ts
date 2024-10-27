import { DOCUMENT } from '@angular/common';
import { inject, Inject, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../core/services/http-client.service';
import { ModalService } from '../../core/services/modal/modalService';
import { ToastService } from '../../shared/components/toast/toast.service';
import { BasicConfirmationResponse } from '../../shared/dto/basic-confirmation-response';
import { IconName } from '../../shared/icon/icon-name';
import { LoginModalComponent } from './login-modal/login-modal.component';

declare const google: any;

export abstract class BaisAuthComponent {
  protected readonly IconName = IconName;
  protected oauthRoute: string;

  hidePasswordInput: WritableSignal<boolean> = signal(false);
  hideRepeatPasswordInput: WritableSignal<boolean> = signal(false);

  modalService = inject(ModalService);

  constructor(
    protected router: Router,
    protected httpClient: HttpService,
    protected toastService: ToastService,
    @Inject(DOCUMENT) protected document: Document,
  ) {
    this.oauthRoute =
      process.env['NODE_ENV'] === 'production'
        ? 'https://trainingsystems.onrender.com/api/user/auth/login/oauth2'
        : 'http://localhost:3000/api/auth/login/oauth2';
  }

  protected loadGoogleClientScript(): Promise<void> {
    console.log('🚀 ~ BaisAuthComponent ~ this.oauthRoute:', this.oauthRoute);

    return new Promise((resolve, reject) => {
      const existingScript = this.document.getElementById('google-client-script');
      if (existingScript) {
        existingScript.remove();
      }

      const script = this.document.createElement('script');
      script.id = 'google-client-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        google.accounts.id.initialize({
          client_id: '745778541640-0f05iimgfid2tag6rkvilau5nqt69ko0.apps.googleusercontent.com',
          login_uri: this.oauthRoute,
          use_fedcm_for_prompt: true,
          callback: (response: any) => this.handleCredentialResponse(response),
        });
        resolve();
      };
      script.onerror = () => reject(new Error('Google script could not be loaded.'));
      this.document.head.appendChild(script);
    });
  }

  protected async navigateTo(event: Event) {
    event.preventDefault();
    const linkElement = event.target as HTMLAnchorElement;
    const url = new URL(linkElement.href).pathname;
    await this.router.navigate([url]);
  }

  protected togglePasswordVisibility(event: Event): void {
    const eyeIcon = event.target as HTMLElement;
    const pwField = eyeIcon.parentElement?.parentElement?.querySelector('.password') as HTMLInputElement;

    if (this.isRepeatPassword(pwField)) {
      console.log('yeh');
      this.hideRepeatPasswordInput.set(!this.hideRepeatPasswordInput());
    } else {
      this.hidePasswordInput.set(!this.hidePasswordInput());
    }

    if (pwField) {
      pwField.type = pwField.type === 'password' ? 'text' : 'password';
    }
  }

  // TODO: diese bitch hier migrierne
  protected triggerGoogleLogin() {
    console.log('click this bitch');
    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        console.log('here');
        this.modalService.open({
          component: LoginModalComponent,
          title: 'Über Google Anmelden',
          hasFooter: false,
        });

        console.warn(
          'Login prompt not shown:',
          notification.getNotDisplayedReason() || notification.getSkippedReason(),
        );
      }
    });
  }

  private isRepeatPassword(passwordInput: HTMLInputElement) {
    return passwordInput.classList.contains('repeat-password');
  }

  private handleCredentialResponse(response: any) {
    const credential = response.credential;

    this.httpClient
      .post<BasicConfirmationResponse>('/auth/login/oauth2', {
        credential: credential,
      })
      .subscribe((response) => {
        this.toastService.success(response.message);
        this.router.navigate(['/'], {
          queryParams: {
            login: true,
          },
        });
      });
  }
}
