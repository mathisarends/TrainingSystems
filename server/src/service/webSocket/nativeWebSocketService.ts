import { Server as HttpServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws'; // Native WebSocket library

class NativeWebSocketService {
  private wss: WebSocketServer | null = null;

  initialize(server: HttpServer): void {
    if (this.wss) return;

    this.wss = new WebSocketServer({ server });

    console.log(`Native WebSocket server attached to the existing HTTP server.`);

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New native WebSocket connection established');

      // Handle incoming messages
      ws.on('message', (message: string) => {
        console.log('Received message from client:', message);
        ws.send(`Echo: ${message}`);
      });

      // Handle disconnections
      ws.on('close', (code, reason) => {
        console.log(`Connection closed with code: ${code}, reason: ${reason}`);
      });

      // Handle errors
      ws.on('error', error => {
        console.error('WebSocket server error:', error);
      });
    });
  }
}

export default new NativeWebSocketService();
