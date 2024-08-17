import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpMethods } from './types/httpMethods';
import { HttpService } from '../service/http/http.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private httpService: HttpService) {}

  isLoggedIn(): Observable<boolean> {
    return this.httpService.request<any>(HttpMethods.GET, 'user/auth-state').pipe(
      map((response) => {
        return true;
      }),
      catchError((error) => {
        console.error('Error during authentication check:', error);
        return of(false); // Rückgabe eines Observables mit dem Wert false bei einem Fehler
      }),
    );
  }
}
