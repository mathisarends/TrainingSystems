import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth-service.service';
import { ModalService } from '../service/modal/modalService';
import { BrowserCheckService } from './browser-check.service';
import { BasicInfoComponent } from './basic-info/basic-info.component';

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
            component: BasicInfoComponent,
            title: 'Anmeldung erforderlich',
            buttonText: 'Anmelden',
            componentData: {
              text: 'Du musst dich anmelden um diese Route benutzen zu können',
            },
          });

          this.router.navigate(['/login']);
        }
      }),
    );
  }
}
