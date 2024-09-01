// websocket.ts
import { Server as SocketIOServer, Socket, Namespace } from 'socket.io';
import { Server as HTTPServer } from 'http';

export class WebSocketService {
  private static instance: WebSocketService;

  private io: SocketIOServer;
  private trainingDayNotificationNamespace: Namespace;

  private constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: [
          'http://localhost:4200',
          'https://trainingsystemsre.onrender.com',
          'http://trainingsystemsre.onrender.com'
        ],
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    // Initialisiere den Namespace und registriere die Ereignisse
    this.trainingDayNotificationNamespace = this.io.of('/training-notification');
    this.setupNamespaceListeners();
  }

  /**
   * Initialisiert die Singleton-Instanz, wenn sie noch nicht existiert.
   *
   * @param {HTTPServer} server - Der HTTP-Server, mit dem Socket.IO verbunden wird.
   */
  public static initialize(server: HTTPServer): void {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService(server);
    }
  }
  /**
   * Statische Methode zum Abrufen der Singleton-Instanz.
   *
   * @returns {WebSocketService} Die Singleton-Instanz von WebSocketService.
   */
  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      throw new Error('WebSocketService is not initialized. Call initialize(server) first.');
    }
    return WebSocketService.instance;
  }

  /**
   * Sendet eine Nachricht an alle Clients im Training Day Notification Namespace.
   */
  sendReloadNotificationSignal(): void {
    this.trainingDayNotificationNamespace.emit('message');
  }

  /**
   * Registriert die Event-Listener für den Training Day Notification Namespace.
   */
  private setupNamespaceListeners(): void {
    this.trainingDayNotificationNamespace.on('connection', (socket: Socket) => {
      const clientId = socket.handshake.query.clientId; // Assume clients send a unique client ID on connection
      console.log(`Ein Benutzer (${clientId}) hat den Training Notification Namespace verbunden.`);

      socket.on('message', msg => {
        this.trainingDayNotificationNamespace.emit('message', msg);
      });

      socket.on('disconnect', () => {
        console.log(`Benutzer (${clientId}) hat den Training Notification Namespace verlassen.`);
      });
    });
  }
}
