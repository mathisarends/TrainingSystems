import { Injectable, signal, WritableSignal } from '@angular/core';
import { UserData } from './user-data';
import { HttpService } from '../http/http-client.service';

@Injectable({ providedIn: 'root' })
export class UserDataService {
  private readonly _userDataSignal: WritableSignal<UserData | undefined> = signal<UserData | undefined>(undefined);

  constructor(private httpService: HttpService) {}

  /**
   * Fetches user data from the backend and updates the signal.
   */
  fetchUserData(): void {
    this.httpService.get<UserData>('/user/profile').subscribe((userData: UserData) => {
      this._userDataSignal.set(userData); // Update the signal with the fetched user data
    });
  }

  /**
   * Getter for user data.
   * Provides read-only access to the current user data.
   * @returns The current value of userData or undefined if not set.
   */
  get userData(): UserData {
    return this._userDataSignal()!;
  }
}
