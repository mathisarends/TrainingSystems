import { Entity } from '../collections/entity.js';
import { InviteStatus } from './invite-status.js';

export interface Friendship extends Entity {
  userId: string;
  friendId: string;
  inviteStatus: InviteStatus;
}
