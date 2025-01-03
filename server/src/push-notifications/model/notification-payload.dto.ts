export interface NotificationPayloadDto {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  actions?: Array<{ action: string; title: string }>;
  vibrate?: number[];
}
