import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, Observable, of } from 'rxjs';
import { HttpService } from '../../../core/http-client.service';
import { ModalService } from '../../../core/services/modal/modalService';
import { BasicInfoComponent } from '../../../shared/components/modal/basic-info/basic-info.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { IconComponent } from '../../../shared/icon/icon.component';
import { BaisAuthComponent } from '../basic-auth.component';
import { ResetPasswordService } from '../request-new-password-email/reset-password.service';

@Component({
  standalone: true,
  imports: [IconComponent, SpinnerComponent],
  providers: [ResetPasswordService],
  selector: 'app-reset-password',
  templateUrl: 'reset-password.component.html',
  styleUrls: ['../auth-shared.scss'],
})
export class ResetPasswordComponent extends BaisAuthComponent implements OnInit {
  password = signal('');
  repeatPassword = signal('');

  token = signal('');

  pageAuthenticated$!: Observable<void>;

  constructor(
    router: Router,
    httpClient: HttpService,
    toastService: ToastService,
    private modalService: ModalService,
    private restPasswordService: ResetPasswordService,
    private activatedRoute: ActivatedRoute,
    @Inject(DOCUMENT) document: Document,
  ) {
    super(router, httpClient, toastService, document);
  }

  async ngOnInit(): Promise<void> {
    const token = this.activatedRoute.snapshot.paramMap.get('token')!;
    this.token.set(token);

    this.restPasswordService
      .authenticatePasswordResetPage(this.token())
      .pipe(
        catchError(async (error) => {
          if (error.status >= 400 && error.status < 500 && error.status !== 401) {
            const response = await this.modalService.open({
              component: BasicInfoComponent,
              title: 'Zurücksetzungs-Token abgelaufen oder ungültig',
              buttonText: 'Neuen Token anfordern',
              componentData: {
                text: 'Der Zurücksetzungs-Token ist abgelaufen oder ungültig. Tokens sind nur für 10 Minuten gültig. Um fortzufahren, fordere bitte einen neuen Zurücksetzungs-Link an.',
              },
            });

            if (response) {
              this.router.navigate(['user/reset-password']);
            } else {
              this.router.navigate(['login']);
            }
          }
        }),
      )
      .subscribe();
  }

  resetPassword(event: Event): void {
    event.preventDefault();

    this.restPasswordService
      .resetPassword(this.password(), this.repeatPassword(), this.token())
      .pipe(
        catchError((error) => {
          if (error.status === 400) {
            this.toastService.error(error.error.message || 'Es ist ein Fehler aufgetreten.');
          }
          return of(null);
        }),
      )
      .subscribe((response) => {
        if (response?.message) {
          this.toastService.success(response.message);
          this.router.navigate(['/login']);
        }
      });
  }

  onPasswordChange(event: Event) {
    const password = (event.target as HTMLInputElement).value;
    this.password.set(password);
  }

  onRepeatPasswordChange(event: Event) {
    const repeatPassword = (event.target as HTMLInputElement).value;
    this.repeatPassword.set(repeatPassword);
  }
}
