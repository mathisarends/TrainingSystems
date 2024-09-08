import { Component, Inject } from '@angular/core';
import { BaisAuthComponent } from '../basic-auth.component';
import { Router } from '@angular/router';
import { HttpService } from '../../../../service/http/http-client.service';
import { ToastService } from '../../../components/toast/toast.service';
import { DOCUMENT } from '@angular/common';
import { ResetPasswordService } from './reset-password.service';

// TODO: implement this component with backend route
@Component({
  selector: 'app-reset-password',
  standalone: true,
  providers: [ResetPasswordService],
  imports: [],
  templateUrl: './reset-password.component.html',
  styleUrls: ['../auth-shared.scss'],
})
export class ResetPasswordComponent extends BaisAuthComponent {
  constructor(
    router: Router,
    httpClient: HttpService,
    toastService: ToastService,
    @Inject(DOCUMENT) document: Document,
  ) {
    super(router, httpClient, toastService, document);
  }

  onSubmit(event: Event) {
    event.preventDefault();

    this.toastService.success('E-Mail erfolgreich versendet');
  }
}
