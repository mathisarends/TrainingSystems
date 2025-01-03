import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';
import { BasicConfirmationResponse } from '../../../shared/dto/basic-confirmation-response';
import { ActivityCalendarData } from '../activity-calendar/activity-calendar-data';
import { UpdateProfilePictureDto } from './update-profile-picture-dto';
import { UserProfileDto } from './user-profile-dto';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  id = signal('');

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

  constructor(private httpService: HttpService) {}

  /**
   * Fetches the user's profile data from the server and updates individual signals.
   */
  fetchAndSetProfileData(): Observable<UserProfileDto> {
    return this.httpService.get<UserProfileDto>('/profile').pipe(
      tap((data: UserProfileDto) => {
        this.id.set(data.id);
        this.username.set(data.name);
        this.email.set(data.email);
        this.pictureUrl.set(data.profilePicture);

        this.isInitalized.set(true);
      }),
    );
  }

  /**
   * Uploads a new profile picture for the user.
   */
  uploadProfilePicture(updateProfilePictureDto: UpdateProfilePictureDto): Observable<UserProfileDto> {
    return this.httpService.post<UserProfileDto>('/profile', updateProfilePictureDto).pipe(
      tap((data: UserProfileDto) => {
        this.pictureUrl.set(data.profilePicture);
      }),
    );
  }

  /**
   * Deletes the user's account from the system.
   */
  deleteAccount(): Observable<BasicConfirmationResponse> {
    return this.httpService.delete('/users');
  }

  /**
   * Retrieves activity calendar data for the user.
   *
   * @param year - The year to include in the query parameters.
   * @returns An `Observable` emitting `ActivityCalendarData` that contains the user's activity data.
   */
  getActivityCalendarData(year: number): Observable<ActivityCalendarData> {
    const params = new HttpParams().set('year', year.toString());
    return this.httpService.get<ActivityCalendarData>('/activity-calendar', params);
  }
}
