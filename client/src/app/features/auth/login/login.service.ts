import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';
import { BasicConfirmationResponse } from '../../../shared/dto/basic-confirmation-response';
import { LoginDto } from './login-dto';

@Injectable()
export class LoginService {
  constructor(private httpService: HttpService) {}

  loginUser(loginDto: LoginDto): Observable<BasicConfirmationResponse> {
    return this.httpService.post<BasicConfirmationResponse>('/user/auth/login', loginDto);
  }
}
