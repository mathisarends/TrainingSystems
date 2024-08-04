import { Entity } from './entity.js';

export interface User extends Entity {
  /**
   * The username of the user.
   */
  username: string;

  /**
   * The email address of the user.
   */
  email: string;

  pictureUrl?: string;
  /**
   * The password of the user. If logged in with google its not required
   */
  password?: string;
}
