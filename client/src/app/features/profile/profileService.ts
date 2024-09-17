import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../core/http-client.service';
import { UserData } from './user-data';

@Injectable()
export class ProfileService {
  constructor(private httpClientService: HttpService) {}

  getProfile(): Observable<UserData> {
    return this.httpClientService.get<UserData>('/user/profile');
  }
}
