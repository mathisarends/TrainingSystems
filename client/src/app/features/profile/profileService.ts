import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpService } from '../../core/services/http-client.service';
import { UserData } from './user-data';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  userData = signal<UserData | undefined>(undefined);

  constructor(private httpClientService: HttpService) {}

  getProfile(): Observable<UserData> {
    return this.httpClientService.get<UserData>('/user/profile').pipe(tap((data: UserData) => this.userData.set(data)));
  }
}
