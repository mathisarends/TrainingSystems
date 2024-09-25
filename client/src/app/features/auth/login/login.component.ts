import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of, tap } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { HttpService } from '../../../core/services/http-client.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { IconComponent } from '../../../shared/icon/icon.component';
import { HeaderService } from '../../header/header.service';
import { BaisAuthComponent } from '../basic-auth.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './login.component.html',
  styleUrls: ['../auth-shared.scss'],
})
export class LoginComponent extends BaisAuthComponent implements OnInit {
  constructor(
    router: Router,
    httpClient: HttpService,
    toastService: ToastService,
    private authService: AuthService,
    private headerService: HeaderService,
    @Inject(DOCUMENT) document: Document,
  ) {
    super(router, httpClient, toastService, document);
  }

  ngOnInit(): Promise<void> {
    this.headerService.setHeadlineInfo({
      title: 'Login',
    });

    return this.loadGoogleClientScript();
  }

  async onSubmit(event: Event) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    this.httpClient
      .post('/user/auth/login', data)
      .pipe(
        tap(() => {
          this.authService.setAuthenticationStatus(true);

          this.router.navigate(['/']);
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Login error:', error);
          this.authService.setAuthenticationStatus(false);

          if (error.status === 401) {
            console.log('Unauthorized: Wrong credentials');
            this.toastService.error('Die Kombination aus Nutzername und Passwort ist falsch');
          } else if (error.status === 400) {
            console.log('Bad request:', error.error);
          } else {
            console.log('An unknown error occurred');
          }

          return of(null);
        }),
      )
      .subscribe();
  }
}
