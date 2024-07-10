import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientService } from '../../../service/http-client.service';
import { HttpMethods } from '../../types/httpMethods';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private httpClientService: HttpClientService) {}

  getProfile(): Observable<any> {
    return this.httpClientService.request<any>(HttpMethods.GET, 'user/profile');
  }
}
