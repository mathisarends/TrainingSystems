import { Component, Inject, OnInit, signal } from '@angular/core';
import { ResetPasswordService } from '../request-new-password-email/reset-password.service';
import { IconComponent } from '../../../shared/icon/icon.component';
import { SpinnerComponent } from '../../../components/loaders/spinner/spinner.component';
import { BaisAuthComponent } from '../basic-auth.component';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../../../../service/http/http-client.service';
import { ToastService } from '../../../components/toast/toast.service';
import { DOCUMENT } from '@angular/common';
import { catchError, Observable, of } from 'rxjs';
import { ModalService } from '../../../../service/modal/modalService';
import { BasicInfoComponent } from '../../modal-pages/basic-info/basic-info.component';

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

    this.restPasswordService
      .authenticatePasswordResetPage(token)
      .pipe(
        catchError(async (error) => {
          if (error.status >= 400 && error.status < 500) {
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

  setNewPassword(event: Event) {
    event.preventDefault();
    this.restPasswordService.resetPassword(this.password(), this.repeatPassword());
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
