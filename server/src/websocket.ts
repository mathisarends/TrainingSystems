// websocket.js
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer;

/**
 * Initialisiert den WebSocket-Server und konfiguriert die Ereignisse.
 *
 * @param {HTTPServer} server - Der HTTP-Server, mit dem Socket.IO verbunden wird.
 */
export function initializeWebSocket(server: HTTPServer): void {
  io = new SocketIOServer(server, {
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

  const trainingDayNotificationNameSpace = io.of('/training-notification');
  trainingDayNotificationNameSpace.on('connection', socket => {
    console.log('Ein Benutzer hat den Training Notification Namespace verbunden.');

    socket.on('message', msg => {
      trainingDayNotificationNameSpace.emit('message', msg);
    });

    socket.on('disconnect', () => {
      console.log('Benutzer hat den Training Notification Namespace verlassen.');
    });
  });
}

/**
 * Funktion, um eine Nachricht an alle Clients im Namespace zu senden.
 */
export function sendReloadNotificationSignal(): void {
  if (io) {
    const trainingDayNotificationNameSpace = io.of('/training-notification');
    trainingDayNotificationNameSpace.emit('message');
  }
}
