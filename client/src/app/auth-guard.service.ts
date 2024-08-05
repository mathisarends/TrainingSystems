import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
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
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.isLoggedIn().pipe(
      tap((isLoggedIn) => {
        if (!isLoggedIn && isPlatformBrowser(this.platformId)) {
          console.log('Aktuelle URL:', state.url);

          // Öffne das Modal zur Authentifizierung
          this.modalService.open({
            component: AuthInfoComponent,
            title: 'Anmeldung erforderlich',
            buttonText: 'Anmelden',
          });

          // Optional: Umleiten auf eine Login-Seite
          this.router.navigate(['/login']);
        }
      })
    );
  }
}
