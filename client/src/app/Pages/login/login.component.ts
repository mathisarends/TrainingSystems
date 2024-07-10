import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClientService } from '../../../service/http-client.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpMethods } from '../../types/httpMethods';
import { DOCUMENT } from '@angular/common';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  constructor(
    private router: Router,
    private httpClient: HttpClientService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  /**
   * Angular lifecycle method that gets called after the component has been initialized.
   * It loads the Google Identity Services script and initializes the Google Sign-In.
   */
  ngOnInit(): void {
    this.loadGoogleScript()
      .then(() => {
        google.accounts.id.initialize({
          client_id:
            '643508334542-dlp04afd8ha9mt3v7pfc5mfkmqea3rqj.apps.googleusercontent.com',
          callback: (response: any) => this.handleCredentialResponse(response),
          ux_mode: 'popup', // Set the ux_mode to popup
        });
      })
      .catch((error) => {
        console.error('Error loading Google script:', error);
      });
  }

  /**
   * Dynamically loads the Google Identity Services script.
   * @returns A Promise that resolves when the script is successfully loaded.
   */

  private loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = this.document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error('Google script could not be loaded.'));
      this.document.head.appendChild(script);
    });
  }

  /**
   * Navigates to the specified URL when a link is clicked.
   * @param event The click event.
   * @returns A Promise that resolves when navigation is complete.
   */
  async navigateTo(event: Event) {
    event.preventDefault();

    const linkElement = event.target as HTMLAnchorElement;
    const url = new URL(linkElement.href).pathname;

    linkElement.classList.add('active');

    try {
      await this.router.navigate([url]);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }

  /**
   * Toggles the visibility of the password field.
   * @param event The click event.
   */
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

  /**
   * Handles the form submission for user login.
   * @param event The form submission event.
   */
  async onSubmit(event: Event) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    try {
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
            } else if (error.status === 400) {
              console.log('Bad request:', error.error);
            } else {
              console.log('An unknown error occurred');
            }
          },
        });
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  }

  /**
   * Handles the Google login button click and triggers the Google sign-in popup.
   * @param event The click event.
   */
  onGoogleLogin(event: Event): void {
    event.preventDefault();
    google.accounts.id.prompt(); // Trigger the Google sign-in popup
  }

  /**
   * Handles the response from Google after a successful login.
   * @param response The response from Google containing the ID token.
   */
  handleCredentialResponse(response: any): void {
    console.log('Encoded JWT ID token: ' + response.credential);

    // Send the token to your server
    this.httpClient
      .request<any>(HttpMethods.POST, 'user/login/oauth2', {
        credential: response.credential,
      })
      .subscribe({
        next: (response: any) => {
          console.log('Google Login successful:', response);
          this.router.navigate(['/']);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Google Login error:', error);
        },
      });
  }
}
