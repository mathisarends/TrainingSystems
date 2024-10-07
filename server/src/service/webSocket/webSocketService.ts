import { Server as HttpServer } from 'http';
import { Socket, Server as SocketIOServer } from 'socket.io';
import { TrainingDayFinishedNotification } from '../../models/collections/user/training-fninished-notifcation.js';
import { NotificationChannel } from './notificationChannel.js';
import { socketAuthMiddleware } from './socketAuthMiddleware.js';
import { UserId } from './userId.type.js';

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

    this.io.use(socketAuthMiddleware);

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

  sendTrainingNotificationToUser(userId: string, notification: TrainingDayFinishedNotification): void {
    this.sendMessageToUser(userId, NotificationChannel.TrainingNotifications, notification);
  }

  sendKeepTimerAliveSignal(userId: string, currentTime: number): void {
    this.sendMessageToUser(userId, NotificationChannel.keepTimerAliveSignal, currentTime);
  }

  private sendMessageToUser(userId: string, channel: NotificationChannel, message: unknown): void {
    const socket = this.userSockets.get(userId);

    if (socket) {
      socket.emit(channel, message);
    } else {
      console.log(`User ${userId} is not connected`);
    }
  }
}

export default new WebSocketService();
