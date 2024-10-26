import { UnauthorizedException } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtPayload } from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { TokenService } from 'src/auth/token.service';
import { FriendshipService } from './friendship.service';

@WebSocketGateway({
  cors: {
    origin: [process.env.DEV_BASE_URL, process.env.PROD_BASE_URL],
    methods: 'GET,POST,PUT,DELETE,PATCH',
    credentials: true,
  },
})
export class FriendshipGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly friendshipService: FriendshipService,
    private readonly tokenService: TokenService,
  ) {}

  afterInit(server: Server) {
    console.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.headers.cookie
        ?.split('; ')
        .find((cookie) => cookie.startsWith('jwt-token='))
        ?.split('=')[1];

      console.log('🚀 ~ handleConnection ~ token:', token);

      if (!token) throw new UnauthorizedException('Token not found');

      const userClaimsSet = this.tokenService.verifyToken(token) as JwtPayload;
      client.data.userId = userClaimsSet.id;

      console.log(
        `Client connected: ${client.id}, User ID: ${client.data.userId}`,
      );
    } catch (error) {
      client.disconnect();
      console.error(`Unauthorized client tried to connect: ${error.message}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendFriendRequest')
  handleFriendRequest(client: Socket, payload: { friendId: string }) {
    const userId = client.data.userId;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const { friendId } = payload;
    this.friendshipService.createFriendRequest(userId, friendId);

    this.server.to(friendId).emit('friendRequestReceived', { userId });
  }

  @SubscribeMessage('notify')
  handleNotification(client: Socket, payload: { message: string }) {
    const userId = client.data.userId;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const { message } = payload;
    this.server.to(userId).emit('notification', { message });
  }
}
