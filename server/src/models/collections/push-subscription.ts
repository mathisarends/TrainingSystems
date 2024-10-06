import { PushSubscription } from 'web-push';
import { Entity } from './entity.js';

export interface UserPushSubscription extends Entity, PushSubscription {
  userId: string;
  fingerprint: string;
}
