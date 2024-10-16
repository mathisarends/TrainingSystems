import { ApplicationRef, DestroyRef, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environment/environment';
import { NotificationChannel } from './notificationChannel';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket!: Socket;
  private webSocketUrl =
    process.env['NODE_ENV'] === 'production' ? environment.webSocketProdUrl : environment.webSocketUrl;

  private amoutOfTrainingDayNotificationsSubject = new Subject<number>();

  private testMessage = new Subject<string>();

  constructor(
    private appRef: ApplicationRef,
    private destroyRef: DestroyRef,
  ) {
    this.appRef.isStable.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((isStable) => {
      if (isStable && !this.socket) {
        this.initializeSocket();
      }
    });
  }

  private initializeSocket(): void {
    if (!this.socket) {
      console.log('Initializing WebSocket connection...');
      this.socket = io(this.webSocketUrl, {
        transports: ['websocket'],
      });

      this.socket.on(NotificationChannel.TrainingNotifications, (message: number) => {
        console.log('Received training notification:', message);
        this.amoutOfTrainingDayNotificationsSubject.next(message);
      });

      this.socket.on(NotificationChannel.MESSAGE, (message: string) => {
        console.log('message', message);
        this.testMessage.next(message);
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected:', this.socket.id);
      });

      this.socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });
    }
  }

  sendMessage(event: string, message: any): void {
    if (this.socket) {
      this.socket.emit(event, message);
    }
  }

  onTrainingNotification(): Observable<number> {
    return this.amoutOfTrainingDayNotificationsSubject.asObservable();
  }

  onTestMessage(): Observable<string> {
    return this.testMessage.asObservable();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
