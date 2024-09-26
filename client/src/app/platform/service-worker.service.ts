import { Injectable } from '@angular/core';
import { BrowserCheckService } from '../core/services/browser-check.service';

@Injectable({
  providedIn: 'root',
})
export class ServiceWorkerService {
  constructor(private browserCheckService: BrowserCheckService) {}

  /**
   * Register the service worker and check for updates.
   */
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }

  /**
   * Sends a message to the service worker.
   * @param message The message to send.
   */
  sendMessageToServiceWorker(message: any): void {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    }
  }

  /**
   * Listen for messages from the service worker and process them using a callback function.
   * @param callback The function to handle the message.
   */
  listenForMessages(callback: (event: MessageEvent) => void): void {
    if (this.browserCheckService.isBrowser() && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', callback);
    }
  }
}
