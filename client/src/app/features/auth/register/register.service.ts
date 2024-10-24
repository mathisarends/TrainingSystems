import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';
import { BasicConfirmationResponse } from '../../../shared/dto/basic-confirmation-response';
import { RegisterUserDto } from './register-user-dto';

/**
 * Service to handle user registration operations.
 */
@Injectable()
export class RegisterService {
  constructor(private httpService: HttpService) {}

  /**
   * Sends registration data to the backend to create a new user account.
   * @param registerDto - The registration details including username, email, password and repeatPassword.
   * @returns Observable of BasicConfirmationResponse indicating the registration result.
   */
  registerUser(registerDto: RegisterUserDto): Observable<BasicConfirmationResponse> {
    return this.httpService.post<BasicConfirmationResponse>('/auth/register', registerDto);
  }
}
