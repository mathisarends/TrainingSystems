import { Entity } from './entity.js';

export interface PushSubscription extends Entity {
  userId: string;
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
}
