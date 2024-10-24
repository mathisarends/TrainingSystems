/**
 * Interface representing the user's basic profile data.
 * This interface defines the structure for user information
 * that is commonly used throughout the application.
 * It includes properties for the user's username, email, and profile picture.
 */
export interface UserProfileDto {
  id: string;
  /**
   * The user's unique username.
   */
  name: string;

  /**
   * The user's email address.
   */
  email: string;

  /**
   * The URL of the user's profile picture.
   * This is a string containing the path or URL to the user's profile image.
   */
  pictureUrl: string;
}
