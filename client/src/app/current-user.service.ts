import { Injectable, signal, WritableSignal } from '@angular/core';
import { ProfileService } from './Pages/profile/profileService';

@Injectable({
  providedIn: 'root',
})
export class CurrentUserService {
  private usernameSignal: WritableSignal<string | null> = signal(null);
  private createdAtSignal: WritableSignal<string | null> = signal(null);
  private emailSignal: WritableSignal<string | null> = signal(null);
  private profilePictureSignal: WritableSignal<string | null> = signal(null);

  constructor(private profileService: ProfileService) {}

  initializeUserData(): void {
    this.profileService.getProfile().subscribe((data) => {
      if (data) {
        this.usernameSignal.set(data.username);
        this.emailSignal.set(data.email);
        this.createdAtSignal.set(data.createdAt);
        this.profilePictureSignal.set(data.pictureUrl);
      }
    });
  }

  clearUserData(): void {
    this.usernameSignal.set(null);
    this.emailSignal.set(null);
    this.createdAtSignal.set(null);
    this.profilePictureSignal.set(null);
  }

  // Getters using the new syntax
  get username(): string | null {
    return this.usernameSignal();
  }

  get createdAt(): string | null {
    return this.createdAtSignal();
  }

  get email(): string | null {
    return this.emailSignal();
  }

  get profilePicture(): string | null {
    return this.profilePictureSignal();
  }
}
