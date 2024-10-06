import { ApplicationRef, DestroyRef, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, of } from 'rxjs';
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

  constructor(
    private browserCheckService: BrowserCheckService,
    private appRef: ApplicationRef,
    private destroyRef: DestroyRef,
  ) {
    this.appRef.isStable.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((isStable) => {
      if (isStable) {
        if (this.browserCheckService.isBrowser()) {
          this.socket = io(this.webSocketUrl, {
            transports: ['websocket'],
          });
        }
      }
    });
  }

  sendMessage(event: string, message: any): void {
    this.socket.emit(event, message);
  }

  onMessage(event: string): Observable<any> {
    if (!this.socket) return of();

    return new Observable<any>((observer) => {
      this.socket.on(event, (data) => {
        observer.next(data);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
