import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

class WebSocketService {
  private io: SocketIOServer | null = null;

  initialize(server: HttpServer): void {
    if (this.io) return;

    this.io = new SocketIOServer(server, {
      cors: {
        origin: [process.env.DEV_BASE_URL!, process.env.PROD_BASE_URL!],
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.io.on('connection', socket => {
      console.log('Client verbunden: ', socket.id);

      socket.on('message', (message: string) => {
        console.log(`Nachricht vom Client erhalten: ${message}`);
        socket.emit('message', `Server hat die Nachricht empfangen: ${message}`);
      });

      socket.on('disconnect', () => {
        console.log('Client getrennt:', socket.id);
      });
    });

    console.log('Socket.IO Server gestartet.');
  }

  broadcastMessage(message: string): void {
    if (!this.io) return;

    this.io.emit('broadcast', message);
  }
}

export default new WebSocketService();
