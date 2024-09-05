import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../../../service/http/http-client.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { ToastService } from '../../../components/toast/toast.service';
import { BaisAuthComponent } from '../basic-auth.component';
import { catchError, of, tap } from 'rxjs';
import { IconComponent } from '../../../shared/icon/icon.component';
import { AuthService } from '../../../../service/auth.service';

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
    @Inject(DOCUMENT) document: Document,
  ) {
    super(router, httpClient, toastService, document);
  }

  ngOnInit(): Promise<void> {
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
      .post('/user/login', data)
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
            this.toastService.show('Ungültige Anmeldedaten', 'Die Kombination aus Nutzername und Passwort ist falsch');
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
