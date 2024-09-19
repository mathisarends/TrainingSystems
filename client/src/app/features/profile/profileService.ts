import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpService } from '../../core/http-client.service';
import { UserData } from './user-data';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  userData: UserData | undefined = undefined;

  constructor(private httpClientService: HttpService) {}

  getProfile(): Observable<UserData> {
    return this.httpClientService.get<UserData>('/user/profile').pipe(tap((data: UserData) => (this.userData = data)));
  }
}
