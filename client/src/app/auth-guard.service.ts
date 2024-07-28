import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth-service.service';
import { ModalService } from '../service/modal/modalService';
import { AuthInfoComponent } from './auth-info/auth-info.component';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private modalService: ModalService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    if (this.authService.isLoggedIn()) {
      return of(true);
    } else {
      sessionStorage.setItem('redirectUrl', state.url);

      console.log('Aktuelle URL:', state.url);
      this.modalService.open({
        component: AuthInfoComponent,
        title: 'Anmeldung erforderlich',
        buttonText: 'Anmelden',
      });

      return of(false);
    }
  }
}
