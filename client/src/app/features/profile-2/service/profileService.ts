import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';
import { BasicConfirmationResponse } from '../../../shared/dto/basic-confirmation-response';
import { UpdateProfilePictureDto } from './update-profile-picture-dto';
import { UserProfileDto } from './user-profile-dto';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  /**
   * Signal Storing the user's username.
   */
  username = signal<string | undefined>(undefined);

  /**
   * Signal storing the user's email address.
   */
  email = signal<string | undefined>(undefined);

  /**
   * Signal storing the user's profile picture URL.
   */
  pictureUrl = signal<string | undefined>(undefined);

  isInitalized = signal(false);

  constructor(private httpClientService: HttpService) {}

  /**
   * Fetches the user's profile data from the server and updates individual signals.
   */
  fetchAndSetProfileData(): Observable<UserProfileDto> {
    return this.httpClientService.get<UserProfileDto>('/user/profile').pipe(
      tap((data: UserProfileDto) => {
        this.username.set(data.username);
        this.email.set(data.email);
        this.pictureUrl.set(data.pictureUrl);

        this.isInitalized.set(true);
      }),
    );
  }

  /**
   * Uploads a new profile picture for the user.
   */
  uploadProfilePicture(updateProfilePictureDto: UpdateProfilePictureDto): Observable<BasicConfirmationResponse> {
    return this.httpClientService.post<any>('/user/profile/update-profile-picture', updateProfilePictureDto);
  }

  /**
   * Deletes the user's account from the system.
   */
  deleteAccount(): Observable<BasicConfirmationResponse> {
    return this.httpClientService.delete<any>('/user/profile/delete-account');
  }
}
