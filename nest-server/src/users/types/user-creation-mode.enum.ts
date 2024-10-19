/**
 * Enum representing the available modes for user creation.
 *
 * - `REGULAR`: Standard user creation where the user signs up with an email and password.
 * - `GOOGLE`: User creation via Google, where the user's credentials are managed through Google's OAuth service.
 */
export enum UserCreationMode {
  REGULAR = 'regular',
  GOOGLE = 'google',
}
