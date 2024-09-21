import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';
import { BasicConfirmationResponse } from '../../../shared/dto/basic-confirmation-response';
import { UserData } from './user-data';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  /**
   * Holds the data of the currently logged in user.
   */
  userData = signal<UserData | undefined>(undefined);

  constructor(private httpClientService: HttpService) {}

  /**
   * Fetches the user's profile data from the server and updates the `userData` signal.
   */
  fetchAndSetProfileData(): Observable<UserData> {
    return this.httpClientService.get<UserData>('/user/profile').pipe(tap((data: UserData) => this.userData.set(data)));
  }

  /**
   * Uploads a new profile picture for the user.
   */
  uploadProfilePicture(profilePicture: string): Observable<BasicConfirmationResponse> {
    return this.httpClientService.post<any>('/user/update-profile-picture', {
      profilePicture: profilePicture,
    });
  }

  /**
   * Deletes the user's account from the system.
   */
  deleteAccount(): Observable<BasicConfirmationResponse> {
    return this.httpClientService.delete<any>('/user/delete-account');
  }
}
