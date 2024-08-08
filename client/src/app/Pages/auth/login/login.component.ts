import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClientService } from '../../../../service/http/http-client.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpMethods } from '../../../types/httpMethods';
import { DOCUMENT } from '@angular/common';
import { ToastService } from '../../../components/toast/toast.service';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrls: ['../auth-shared.scss'],
})
export class LoginComponent implements OnInit {
  constructor(
    private router: Router,
    private httpClient: HttpClientService,
    private toastService: ToastService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  oauthRoute =
    process.env['NODE_ENV'] === 'production'
      ? 'https://trainingsystems.onrender.com/user/login/oauth2'
      : 'http://localhost:3000/user/login/oauth2';

  ngOnInit(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Prüfen, ob das Skript bereits existiert
      const existingScript = this.document.getElementById(
        'google-client-script'
      );
      if (existingScript) {
        existingScript.remove();
      }

      // Skript erstellen und zum Head hinzufügen
      const script = this.document.createElement('script');
      script.id = 'google-client-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        google.accounts.id.initialize({});
        resolve();
      };
      script.onerror = () =>
        reject(new Error('Google script could not be loaded.'));
      this.document.head.appendChild(script);
    });
  }

  async navigateTo(event: Event) {
    event.preventDefault();

    const linkElement = event.target as HTMLAnchorElement;
    const url = new URL(linkElement.href).pathname;

    try {
      await this.router.navigate([url]);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }

  togglePasswordVisibility(event: Event): void {
    const eyeIcon = event.target as HTMLElement;
    const pwFields =
      eyeIcon.parentElement?.parentElement?.querySelectorAll('.password');
    pwFields?.forEach((password) => {
      if (password instanceof HTMLInputElement) {
        if (password.type === 'password') {
          password.type = 'text';
          eyeIcon.classList.replace('bx-hide', 'bx-show');
        } else {
          password.type = 'password';
          eyeIcon.classList.replace('bx-show', 'bx-hide');
        }
      }
    });
  }

  async onSubmit(event: Event) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    this.httpClient
      .request<any>(HttpMethods.POST, 'user/login', data)
      .subscribe({
        next: (response: Response) => {
          console.log('Login successful:', response);
          this.router.navigate(['/']);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Login error:', error);
          if (error.status === 401) {
            console.log('Unauthorized: Wrong credentials');
            this.toastService.show(
              'Ungültige Anmeldedaten',
              'Die Kombination aus Nutzername und Passwort ist falsch'
            );
          } else if (error.status === 400) {
            console.log('Bad request:', error.error);
          } else {
            console.log('An unknown error occurred');
          }
        },
      });
  }
}
