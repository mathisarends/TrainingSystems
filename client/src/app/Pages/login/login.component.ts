import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  constructor(private router: Router) {}

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
}
