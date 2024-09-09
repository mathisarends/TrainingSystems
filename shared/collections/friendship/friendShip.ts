import { Entity } from './entity.js';

export interface Friendship extends Entity {
  userId: string;
  friendId: string;
  inviteStatus: InviteStatus;
}

// InviteStatus.ts
export enum InviteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  BLOCKED = 'BLOCKED'
}
