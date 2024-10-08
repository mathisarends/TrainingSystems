export interface RestTimer {
  remainingTime: number;
  fingerprint: string;
  intervalId: NodeJS.Timeout;
}
