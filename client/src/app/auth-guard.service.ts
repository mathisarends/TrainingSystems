import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth-service.service';
import { ModalService } from '../service/modal/modalService';
import { AuthInfoComponent } from './auth-info/auth-info.component';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private modalService: ModalService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    if (this.authService.isLoggedIn()) {
      return of(true);
    } else {
      if (isPlatformBrowser(this.platformId)) {
        sessionStorage.setItem('redirectUrl', state.url);

        console.log('Aktuelle URL:', state.url);
        this.modalService.open({
          component: AuthInfoComponent,
          title: 'Anmeldung erforderlich',
          buttonText: 'Anmelden',
        });

        return of(false);
      }

      return of(false);
    }
  }
}
