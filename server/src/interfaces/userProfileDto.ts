/**
 * Data Transfer Object representing the user's profile information.
 */
export interface UserProfileDto {
  id: string;
  username: string;
  email: string;
  pictureUrl?: string;
}
