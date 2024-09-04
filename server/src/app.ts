import express, { Express } from 'express';
import http from 'http';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import startDB from './db.js';

import cors from 'cors';

// Routers
import userRouter from './routes/userRoutes.js';
import trainingRouter from './routes/trainingRoutes.js';
import exerciseRouter from './routes/exerciseRoutes.js';
import friendShipRouter from './routes/friendshipRoutes.js';
import { errorHandler } from './middleware/error-handler.js';
import { WebSocketService } from './service/web-socket.service.js';

dotenv.config();

const PORT = process.env.port ? parseInt(process.env.port, 10) : 3000;

async function configureApp(app: Express) {
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());

  app.use(
    cors({
      origin: [
        'http://localhost:4200',
        'https://trainingsystemsre.onrender.com',
        'http://trainingsystemsre.onrender.com'
      ],
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Authorization'
    })
  );

  app.use('/user', userRouter);
  app.use('/training', trainingRouter);
  app.use('/exercise', exerciseRouter);
  app.use('/friendship', friendShipRouter);

  app.use(errorHandler);
}

export async function start() {
  const app = express();
  await configureApp(app);
  await startDB(app);

  // Erstelle einen HTTP-Server, der sowohl von Express als auch von Socket.IO verwendet wird
  const server = http.createServer(app);

  /* WebSocketService.initialize(server); */

  // Starte den kombinierten HTTP und WebSocket-Server
  server.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
  });
}

start();
