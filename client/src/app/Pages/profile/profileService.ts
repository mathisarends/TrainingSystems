import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../service/http/http-client.service';
import { UserData } from '../../../service/user-data-service/user-data';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private httpClientService: HttpService) {}

  getProfile(): Observable<UserData> {
    return this.httpClientService.get<UserData>('/user/profile');
  }
}
