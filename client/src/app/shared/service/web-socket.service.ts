import { ApplicationRef, DestroyRef, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { BrowserCheckService } from '../../core/services/browser-check.service';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket!: Socket;
  private webSocketUrl =
    process.env['NODE_ENV'] === 'production' ? environment.webSocketProdUrl : environment.webSocketUrl;

  // Subjects to handle incoming messages for different events
  private messageSubject: Subject<any> = new Subject<any>();
  private privateMessageSubject: Subject<any> = new Subject<any>();

  constructor(
    private browserCheckService: BrowserCheckService,
    private appRef: ApplicationRef,
    private destroyRef: DestroyRef,
  ) {
    this.appRef.isStable.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((isStable) => {
      if (isStable && this.browserCheckService.isBrowser() && !this.socket) {
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

      // Listen for the general message event
      this.socket.on('message', (message: any) => {
        console.log('Received message:', message);
        this.messageSubject.next(message); // Notify all subscribers
      });

      // Listen for the private-message event
      this.socket.on('private-message', (message: any) => {
        console.log('Received private message:', message);
        this.privateMessageSubject.next(message); // Notify all subscribers
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected:', this.socket.id);
      });

      this.socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });
    }
  }

  // Method to send messages to the server
  sendMessage(event: string, message: any): void {
    if (this.socket) {
      this.socket.emit(event, message);
    }
  }

  // Listen for general messages (event: 'message')
  onMessage(): Observable<any> {
    return this.messageSubject.asObservable(); // Allows components to subscribe to messages
  }

  // Listen for private messages (event: 'private-message')
  onPrivateMessage(): Observable<any> {
    return this.privateMessageSubject.asObservable(); // Allows components to subscribe to private messages
  }

  // Clean up when necessary
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
