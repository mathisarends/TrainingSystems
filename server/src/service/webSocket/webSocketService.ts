import { Server as HttpServer } from 'http';
import { Socket, Server as SocketIOServer } from 'socket.io';
import { TrainingDayFinishedNotification } from '../../models/collections/user/training-fninished-notifcation.js';
import { NotificationChannel } from './notificationChannel.js';
import { socketAuthMiddleware } from './socketAuthMiddleware.js';
import { UserId } from './userId.type.js';

class WebSocketService {
  private io: SocketIOServer | null = null;
  // Map to store an array of sockets for each user
  private userSockets: Map<UserId, Socket[]> = new Map();

  initialize(server: HttpServer): void {
    if (this.io) return;

    this.io = new SocketIOServer(server, {
      path: '/socket-io',
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

      if (this.userSockets.has(userId)) {
        this.userSockets.get(userId)!.push(socket);
      } else {
        this.userSockets.set(userId, [socket]);
      }

      socket.on('disconnect', () => {
        console.log('User disconnected:', userId);
        this.removeSocket(userId, socket);
      });
    });
  }

  sendTrainingNotificationToUser(userId: string, notification: TrainingDayFinishedNotification): void {
    this.sendMessageToUser(userId, NotificationChannel.TrainingNotifications, notification);
  }

  sendKeepTimerAliveSignal(userId: string, currentTime: number): void {
    this.sendMessageToUser(userId, NotificationChannel.keepTimerAliveSignal, currentTime);
  }

  sendTestMessageToUser(userId: string, message: string): void {
    this.sendMessageToUser(userId, NotificationChannel.MESSAGE, message);
  }

  private removeSocket(userId: UserId, socket: Socket): void {
    const userSocketArray = this.userSockets.get(userId);

    if (!userSocketArray) return;

    const updatedSockets = userSocketArray.filter(s => s !== socket);
    if (updatedSockets.length > 0) {
      this.userSockets.set(userId, updatedSockets);
    } else {
      this.userSockets.delete(userId);
    }
  }

  private sendMessageToUser(userId: string, channel: NotificationChannel, message: unknown): void {
    const userSocketArray = this.userSockets.get(userId);
    console.log('🚀 ~ WebSocketService ~ sendMessageToUser ~ userSocketArray:', userSocketArray);

    if (!userSocketArray || userSocketArray.length === 0) {
      console.log(`User ${userId} is not connected`);
      return;
    }

    userSocketArray.forEach(socket => {
      socket.emit(channel, message);
    });
  }
}

export default new WebSocketService();
