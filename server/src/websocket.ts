// websocket.js
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

/**
 * Initialisiert den WebSocket-Server und konfiguriert die Ereignisse.
 *
 * @param {HTTPServer} server - Der HTTP-Server, mit dem Socket.IO verbunden wird.
 */
export function initializeWebSocket(server: HTTPServer): void {
  const io = new SocketIOServer(server, {
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

  io.on('connection', socket => {
    console.log('Ein Benutzer ist verbunden.');

    socket.on('message', msg => {
      console.log('Nachricht erhalten:', msg);
      io.emit('message', msg);
    });

    socket.on('disconnect', () => {
      console.log('Benutzer hat die Verbindung getrennt.');
    });
  });
}
