import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../service/http/http.service';
import { HttpMethods } from '../../types/httpMethods';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private httpClientService: HttpService) {}

  getProfile(): Observable<any> {
    return this.httpClientService.request<any>(HttpMethods.GET, 'user/profile');
  }
}
