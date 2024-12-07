import { Injectable } from '@angular/core';
import { HttpService } from '../../core/services/http-client.service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VolumeCalculatorService {
  constructor(private httpService: HttpService) {}

  getVolumeCalculatorData(): Observable<any> {
    return of();
  }

  postVolumeCalculatorData(): Observable<any> {
    return of();
  }
}
