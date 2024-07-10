import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { HttpClientService } from '../../service/http-client.service.js';
import { HttpMethods } from '../types/httpMethods';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  constructor(private router: Router, private httpClient: HttpClientService) {}

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

  togglePasswordVisibility(event: Event): void {
    const eyeIcon = event.target as HTMLElement;
    const pwField = eyeIcon.parentElement?.querySelector(
      '.password'
    ) as HTMLInputElement;

    if (pwField) {
      if (pwField.type === 'password') {
        pwField.type = 'text';
        eyeIcon.classList.replace('bx-hide', 'bx-show');
      } else {
        pwField.type = 'password';
        eyeIcon.classList.replace('bx-show', 'bx-hide');
      }
    }
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const data = {
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    };
    this.httpClient
      .request<any>(HttpMethods.POST, 'user/register', data)
      .subscribe({
        next: (response: Response) => {
          console.log('Account erfolgreich erstellt');
          this.router.navigate(['login']);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Registration error:', error);
          if (error.status === 409) {
            console.log('User already exists');
          } else if (error.status === 400) {
            console.log('Bad request:', error.error);
          } else {
            console.log('An unknown error occurred');
          }
        },
      });
  }
}
