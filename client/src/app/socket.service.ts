import { ApplicationRef, inject, Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { first, Observable } from 'rxjs';
import { environment } from '../config/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private url: string = process.env['NODE_ENV'] === 'production' ? environment.produUrl : environment.apiUrl;
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000', { autoConnect: false });
    inject(ApplicationRef)
      .isStable.pipe(first((isStable) => isStable))
      .subscribe(() => {
        this.socket.connect();
      });
  }

  /**
   * Sendet eine Nachricht an den Server.
   * @param message - Die zu sendende Nachricht.
   */
  sendMessage(message: string): void {
    this.socket.emit('message', message);
  }

  /**
   * Empfängt Nachrichten vom Server.
   * @returns Ein Observable, das empfangene Nachrichten abonniert.
   */
  onMessage(): Observable<string> {
    return new Observable<string>((observer) => {
      this.socket.on('message', (message: string) => {
        observer.next(message);
      });
    });
  }

  /**
   * Trennt die Socket-Verbindung.
   */
  disconnect(): void {
    this.socket.disconnect();
  }
}
