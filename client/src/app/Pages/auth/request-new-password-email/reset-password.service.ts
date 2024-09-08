import { Injectable } from '@angular/core';
import { HttpService } from '../../../../service/http/http-client.service';
import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { BasicConfirmationResponse } from '../../../types/dto/basic-confirmation-response';

@Injectable()
export class ResetPasswordService {
  constructor(private httpService: HttpService) {}

  /**
   * Requests a password reset link to be sent to the user's email.
   *
   * Backend Route:
   * - `POST /user/send-reset-password-email`
   *
   * Example Usage:
   * - Sends a password reset link to the provided email address.
   */
  requestPasswordResetLink(email: string): Observable<HttpResponse<any>> {
    return this.httpService.post('/user/send-reset-password-email', { email });
  }

  /**
   * Authenticates the password reset page using a token.
   *
   * Backend Route:
   * - `GET /user/authenticate-password-request`
   *
   */
  authenticatePasswordResetPage(token: string): Observable<void> {
    return this.httpService.get(`/user/authenticate-password-request/${token}`);
  }

  /**
   * Resets the user's password.
   *
   * Backend Route:
   * - `POST /user/reset-password`
   *
   */
  resetPassword(password: string, repeatPassword: string, token: string): Observable<BasicConfirmationResponse> {
    return this.httpService.post(`/user/reset-password/${token}`, { password, repeatPassword });
  }
}
