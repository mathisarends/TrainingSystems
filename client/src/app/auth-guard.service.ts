import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { combineLatest, Observable, of } from 'rxjs';
import { AuthService } from './auth-service.service';
import { DeleteConfirmationComponent } from './Pages/delete-confirmation/delete-confirmation.component';
import { ModalService } from '../service/modal/modalService';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService
  ) {}

  canActivate() {
    if (this.authService.isLoggedIn()) {
      return of(true);
    } else {
      this.modalService.open({
        component: DeleteConfirmationComponent,
        title: 'Anmeldung erforderlich',
        buttonText: 'Anmelden',
      });

      return of(false);
    }
  }
}
