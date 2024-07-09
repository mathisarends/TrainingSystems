import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticatorService {
  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  public isAuthenticated$: Observable<boolean>;

  constructor() {
    // Initialisieren mit dem Anmeldestatus (hier als nicht angemeldet)
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  }

  // Methode, um den Anmeldestatus zu ändern
  setAuthenticated(status: boolean): void {
    this.isAuthenticatedSubject.next(status);
  }

  // Methode, um den aktuellen Anmeldestatus zu erhalten
  getAuthenticated(): boolean {
    return this.isAuthenticatedSubject.getValue();
  }

  // Optional: An- und Abmeldemethoden
  login(): void {
    this.setAuthenticated(true);
  }

  logout(): void {
    this.setAuthenticated(false);
  }
}
