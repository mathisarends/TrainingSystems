import { IsNotEmpty, IsString } from 'class-validator';

export class PushSubscriptionKeysDto {
  @IsString()
  @IsNotEmpty()
  p256dh: string;

  @IsString()
  @IsNotEmpty()
  auth: string;
}

export class CreatePushSubscriptionDto {
  @IsNotEmpty()
  endpoint: string;

  @IsNotEmpty()
  keys: PushSubscriptionKeysDto;
}
