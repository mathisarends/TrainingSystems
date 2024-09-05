import { Injectable, signal, WritableSignal } from '@angular/core';
import { UserData } from './user-data';
import { HttpService } from '../http/http-client.service';
import { map, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserDataService {
  private readonly _userDataSignal: WritableSignal<UserData | undefined> = signal<UserData | undefined>(undefined);

  constructor(private httpService: HttpService) {}

  /**
   * Fetches user data from the backend and updates the signal.
   * @returns An Observable that emits when the user data fetch is done.
   */
  fetchUserData(): Observable<void> {
    return this.httpService.get<UserData>('/user/profile').pipe(
      tap((userData: UserData) => {
        this._userDataSignal.set(userData);
      }),
      map(() => void 0),
    );
  }

  /**
   * Getter for user data.
   * Provides read-only access to the current user data.
   * @returns The current value of userData or undefined if not set.
   */
  get userData(): UserData | undefined {
    return this._userDataSignal();
  }
}
