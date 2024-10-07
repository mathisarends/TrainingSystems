import cookie from 'cookie';
import { DefaultEventsMap, Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { authService } from '../authService.js';

export const socketAuthMiddleware = (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>,
  next: (err?: ExtendedError) => void
): void => {
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
};
