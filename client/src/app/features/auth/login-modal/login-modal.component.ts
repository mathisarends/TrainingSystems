import { DOCUMENT } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { InfoComponent } from '../../../shared/components/info/info.component';

declare const google: any;

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [InfoComponent],
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss'],
})
export class LoginModalComponent implements OnInit {
  private document = inject(DOCUMENT);

  oauthRoute =
    process.env['NODE_ENV'] === 'production'
      ? 'https://trainingsystems.onrender.com/api/user/auth/login/oauth2/redirect'
      : 'http://localhost:3000/api/auth/login/oauth2/redirect';

  ngOnInit(): void {
    this.loadGoogleClientScript();
  }

  protected loadGoogleClientScript(): Promise<void> {
    console.log('🚀 ~ LoginModalComponent ~ this.oauthRoute:', this.oauthRoute);

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
        });
        resolve();
      };
      script.onerror = () => reject(new Error('Google script could not be loaded.'));
      this.document.head.appendChild(script);
    });
  }
}
