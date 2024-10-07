import cookie from 'cookie'; // Use cookie parsing library
import { Server as HttpServer } from 'http';
import { Socket, Server as SocketIOServer } from 'socket.io';
import { authService } from './authService.js';

type UserId = string;

class WebSocketService {
  private io: SocketIOServer | null = null;
  private userSockets: Map<UserId, Socket> = new Map();

  initialize(server: HttpServer): void {
    if (this.io) return;

    this.io = new SocketIOServer(server, {
      cors: {
        origin: [process.env.DEV_BASE_URL!, process.env.PROD_BASE_URL!],
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    // Middleware to authenticate the WebSocket connection
    this.io.use((socket, next) => {
      const cookies = cookie.parse(socket.handshake.headers.cookie ?? '');
      const token = cookies['jwt-token'];
      if (!token) {
        return next(new Error('Authentication error: Token not found'));
      }

      try {
        const user = authService.verifyToken(token);
        socket.data.user = user;
        next();
      } catch (err) {
        return next(new Error('Authentication error: Invalid token'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const userId = socket.data.user.id;
      console.log('User connected:', userId);

      // Store the socket with the user ID
      this.userSockets.set(userId, socket);

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('User disconnected:', userId);
        this.userSockets.delete(userId);
      });
    });
  }

  // Send a message to a specific user by user ID
  sendMessageToUser(userId: string, message: string): void {
    const socket = this.userSockets.get(userId);
    if (socket) {
      socket.emit('private-message', message);
    } else {
      console.log(`User ${userId} is not connected`);
    }
  }
}

export default new WebSocketService();
