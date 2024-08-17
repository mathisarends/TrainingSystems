import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../service/http/http-client.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private httpClientService: HttpService) {}

  getProfile(): Observable<any> {
    return this.httpClientService.get<any>('/user/profile');
  }
}
