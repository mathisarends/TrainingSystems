import { Injectable } from '@angular/core';
import { BrowserCheckService } from '../core/services/browser-check.service';
import { HttpService } from '../core/services/http-client.service';

@Injectable({
  providedIn: 'root',
})
export class ServiceWorkerService {
  private VAPID_PUBLIC_KEY = 'BOLKmNpP6togP7OJDnS2bR1I-Tut9tpUWzYJBLAsc-m3MlR36roqEtWXjPaKlQ1IXiXAA6wCvxTzTQn0FATAUms';

  constructor(
    private browserCheckService: BrowserCheckService,
    private httpService: HttpService,
  ) {}

  /**
   * Register the service worker and check for updates.
   */
  registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker
      .register('/service-worker.js', {
      })
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);

        if (registration.active) {
          registration.active.postMessage({
            webSocketUrl: 'wss://production.example.com/ws',
          });
        }

        this.checkAndSubscribeToPushNotifications(registration);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  }

  /**
   * Prüfe, ob bereits die Push-Benachrichtigung-Berechtigung erteilt wurde und abonniere ggf. den Push-Dienst.
   */
  private checkAndSubscribeToPushNotifications(registration: ServiceWorkerRegistration): void {
    if (Notification.permission === 'granted') {
      this.subscribeToPushNotifications(registration);
    } else if (Notification.permission !== 'denied') {
      this.requestNotificationPermission(registration);
    }
  }

  /**
   * Fordert die Berechtigung für Push-Benachrichtigungen an.
   */
  requestNotificationPermission(registration: ServiceWorkerRegistration): void {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        this.subscribeToPushNotifications(registration);
      } else {
        console.error('Permission not granted for notifications.');
      }
    });
  }

  /**
   * Erstelle eine Push-Subscription und sende sie an den Server.
   */
  private subscribeToPushNotifications(registration: ServiceWorkerRegistration): void {
    const applicationServerKey = this.urlBase64ToUint8Array(this.VAPID_PUBLIC_KEY);

    registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      })
      .then((subscription) => {
        this.sendSubscriptionToServer(subscription);
      })
      .catch((error) => {
        console.error('Failed to subscribe the user:', error);
      });
  }

  /**
   * Sende die Push-Subscription an den Server, um sie dort zu speichern.
   */
  private sendSubscriptionToServer(subscription: PushSubscription) {
    this.httpService
      .post('/push-notifications/subscribe', {
        subscription,
      })
      .subscribe(() => {
        console.log('Push-Subscription erfolgreich an den Server gesendet.');
      });
  }

  /**
   * Konvertiere den Base64-String in ein Uint8Array, um den VAPID-Schlüssel korrekt zu verwenden.
   */
  private urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
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
