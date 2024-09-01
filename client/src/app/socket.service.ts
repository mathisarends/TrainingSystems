import { ApplicationRef, inject, Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { first, Observable } from 'rxjs';
import { environment } from '../config/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private url: string = process.env['NODE_ENV'] === 'production' ? environment.produUrl : environment.apiUrl;

  private trainingDayNotificationSocket: Socket;

  constructor() {
    this.trainingDayNotificationSocket = io(`${this.url}/training-notification`, {
      autoConnect: false,
      query: {
        clientId: 'your-unique-client-id',
      },
    });
    inject(ApplicationRef)
      .isStable.pipe(first((isStable) => isStable))
      .subscribe(() => {
        this.trainingDayNotificationSocket.connect();
      });
  }

  /**
   * Sendet eine Nachricht an den Server.
   * @param message - Die zu sendende Nachricht.
   */
  sendMessage(message: string): void {
    this.trainingDayNotificationSocket.emit('message', message);
  }

  /**
   * Empfängt Nachrichten vom Server.
   * @returns Ein Observable, das empfangene Nachrichten abonniert.
   */
  onTrainingDayNotificationMessage(): Observable<string> {
    return new Observable<string>((observer) => {
      this.trainingDayNotificationSocket.on('message', (message: string) => {
        observer.next(message);
      });
    });
  }

  /**
   * Trennt die Socket-Verbindung.
   */
  disconnect(): void {
    this.trainingDayNotificationSocket.disconnect();
  }
}
