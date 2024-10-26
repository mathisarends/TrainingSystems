import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket!: Socket;
  private webSocketUrl = environment.webSocketUrl;

  private notificationSubject = new Subject<string>();
  private friendRequestSubject = new Subject<{ userId: string }>();

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket(): void {
    if (!this.socket) {
      console.log('Initializing WebSocket connection...');
      this.socket = io(this.webSocketUrl, {
        transports: ['websocket'],
        withCredentials: true,
      });

      this.socket.on('notification', (message: string) => {
        console.log('Received notification:', message);
        this.notificationSubject.next(message);
      });

      this.socket.on('friendRequestReceived', (data: { userId: string }) => {
        console.log('Received friend request from:', data.userId);
        this.friendRequestSubject.next(data);
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected:', this.socket.id);
      });

      this.socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });
    }
  }

  sendFriendRequest(friendId: string): void {
    if (this.socket) {
      this.socket.emit('sendFriendRequest', { friendId });
    }
  }
  // Abonnieren von Notifications
  onNotification(): Observable<string> {
    return this.notificationSubject.asObservable();
  }

  onFriendRequest(): Observable<{ userId: string }> {
    return this.friendRequestSubject.asObservable();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
