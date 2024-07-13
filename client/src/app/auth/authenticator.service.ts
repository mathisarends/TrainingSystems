import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProfileService } from '../Pages/profile/profileService';
import { User } from '../types/user';

@Injectable({
  providedIn: 'root',
})
export class AuthenticatorService {
  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  public isAuthenticated$: Observable<boolean>;

  private userDetails!: User;

  constructor(private profileService: ProfileService) {
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

  getUserDetails(): User {
    return this.userDetails;
  }

  fetchUserDetails() {
    this.profileService.getProfile().subscribe({
      next: (data) => {
        console.log(
          '🚀 ~ AuthenticatorService ~ this.profileService.getProfile ~ data:',
          data
        );
        this.userDetails = data.userDto;
      },
      error: (err) => {
        console.error('Fehler beim Abrufen des Profils', err);
      },
      complete: () => {
        console.log('Profil erfolgreich geladen');
      },
    });
  }
}
