import { Request } from 'express';

export interface PushSubscriptionRequest extends Request {
  body: {
    subscription: {
      endpoint: string;
      keys: {
        p256dh: string;
        auth: string;
      };
    };
  };
}
