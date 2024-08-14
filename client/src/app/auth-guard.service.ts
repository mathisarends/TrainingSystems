import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth-service.service';
import { ModalService } from '../service/modal/modalService';
import { AuthInfoComponent } from './auth-info/auth-info.component';
import { BrowserCheckService } from './browser-check.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private modalService: ModalService,
    private router: Router,
    private browserCheckService: BrowserCheckService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.isLoggedIn().pipe(
      tap((isLoggedIn) => {
        if (!isLoggedIn && this.browserCheckService.isBrowser()) {
          this.modalService.open({
            component: AuthInfoComponent,
            title: 'Anmeldung erforderlich',
            buttonText: 'Anmelden',
          });

          this.router.navigate(['/login']);
        }
      }),
    );
  }
}
