import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Injectable({
  providedIn: 'root',
})
export class ServiceWorkerService {
  constructor(private swUpdate: SwUpdate) {}
  /**
   * Register the service worker and check for updates.
   */
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/ngsw-worker.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
          this.checkForUpdates();
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }

  /**
   * Checks for updates in the service worker.
   */
  private checkForUpdates() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.subscribe((event) => {
        if (event.type === 'VERSION_READY') {
          console.log('A new version is available. Refresh the page to update.');
          if (confirm('A new version is available. Load new version?')) {
            window.location.reload();
          }
        }
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
   * Listen for messages from the service worker.
   */
  listenForMessages(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data) {
          console.log('Message from Service Worker:', event.data);
          // Handle the received message
        }
      });
    }
  }
}
