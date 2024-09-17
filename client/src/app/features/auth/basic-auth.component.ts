import { DOCUMENT } from '@angular/common';
import { Inject, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../core/http-client.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { IconName } from '../../shared/icon/icon-name';

declare const google: any;

export abstract class BaisAuthComponent {
  protected readonly IconName = IconName;
  protected oauthRoute: string;

  hidePasswordInput: WritableSignal<boolean> = signal(false);
  hideRepeatPasswordInput: WritableSignal<boolean> = signal(false);

  constructor(
    protected router: Router,
    protected httpClient: HttpService,
    protected toastService: ToastService,
    @Inject(DOCUMENT) protected document: Document,
  ) {
    this.oauthRoute =
      process.env['NODE_ENV'] === 'production'
        ? 'https://trainingsystems.onrender.com/user/login/oauth2'
        : 'http://localhost:3000/user/login/oauth2';
  }

  protected loadGoogleClientScript(): Promise<void> {
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
        google.accounts.id.initialize({});
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

  private isRepeatPassword(passwordInput: HTMLInputElement) {
    return passwordInput.classList.contains('repeat-password');
  }
}
