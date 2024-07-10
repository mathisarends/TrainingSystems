import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClientService } from '../../../service/http-client.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpMethods } from '../../types/httpMethods';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
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
}
