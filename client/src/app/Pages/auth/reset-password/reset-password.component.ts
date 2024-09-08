import { Component } from '@angular/core';
import { ResetPasswordService } from '../request-new-password-email/reset-password.service';

@Component({
  standalone: true,
  imports: [],
  providers: [ResetPasswordService],
  selector: 'app-reset-password',
  templateUrl: 'reset-password.component.html',
  styleUrls: ['../auth-shared.scss'],
})
export class ResetPasswordComponent {
  constructor() {}
}
