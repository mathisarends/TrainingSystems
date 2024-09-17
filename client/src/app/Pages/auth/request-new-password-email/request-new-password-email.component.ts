import { Component, Inject, signal } from '@angular/core';
import { BaisAuthComponent } from '../basic-auth.component';
import { Router } from '@angular/router';
import { HttpService } from '../../../core/http-client.service';
import { ToastService } from '../../../components/toast/toast.service';
import { DOCUMENT } from '@angular/common';
import { ResetPasswordService } from './reset-password.service';
import { catchError, filter, of, tap } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  providers: [ResetPasswordService],
  imports: [],
  templateUrl: './request-new-password-email.component.html',
  styleUrls: ['../auth-shared.scss'],
})
export class RequestNewPasswordEmail extends BaisAuthComponent {
  email = signal('');

  constructor(
    router: Router,
    httpClient: HttpService,
    toastService: ToastService,
    private resetPasswordService: ResetPasswordService,
    @Inject(DOCUMENT) document: Document,
  ) {
    super(router, httpClient, toastService, document);
  }

  requestPasswordResetMail(event: Event) {
    event.preventDefault();

    this.resetPasswordService
      .requestPasswordResetLink(this.email())
      .pipe(
        filter((response: HttpResponse<any>) => response.status === 200),
        tap(() => {
          console.log('test');
          this.toastService.success('E-Mail erfolgreich versendet');
        }),
        catchError((error) => {
          console.error('Error sending password reset email:', error);

          if (error.status === 400) {
            this.toastService.error('Ungültige E-Mail-Adresse');
          } else if (error.status === 500) {
            this.toastService.error('Serverfehler. Bitte versuchen Sie es später erneut.');
          } else {
            this.toastService.error('Es gab einen Fehler beim Senden der E-Mail');
          }
          return of(null);
        }),
      )
      .subscribe();
  }

  protected onEmailChange(event: Event) {
    const email = (event.target as HTMLInputElement).value;
    this.email.set(email);
  }
}
