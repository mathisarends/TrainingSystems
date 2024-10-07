export interface RestTimer {
  userId: string;
  remainingTime: number;
  intervalId: NodeJS.Timeout;
}
