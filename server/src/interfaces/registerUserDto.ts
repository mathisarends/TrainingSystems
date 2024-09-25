/**
 * Data Transfer Object for user registration.
 * This interface defines the structure of the registration request payload,
 * containing the necessary information to create a new user account.
 */
export interface RegisterUserDto {
  /**
   * The desired username for the new user.
   */
  username: string;

  /**
   * The email address for the new user.
   */
  email: string;

  /**
   * The password for the new user's account.
   */
  password: string;

  /**
   * The confirmation of the password to ensure both match.
   */
  confirmPassword: string;
}
