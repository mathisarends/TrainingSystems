import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express, { Express } from 'express';
import http from 'http';
import startDB from './db.js';

import cors from 'cors';

// Routers
import { errorHandler } from './middleware/error-handler.js';
import exerciseRouter from './routes/exerciseRoutes.js';
import friendShipRouter from './routes/friendshipRoutes.js';
import trainingRouter from './routes/trainingRoutes.js';
import userRouter from './routes/user/userRoutes.js';

dotenv.config();

const PORT = process.env.port ? parseInt(process.env.port, 10) : 3000;

const DEV_BASE_URL = process.env.DEV_BASE_URL!;
const PROD_BASE_URL = process.env.PROD_BASE_URL!;

async function configureApp(app: Express) {
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());

  app.use(
    cors({
      origin: [DEV_BASE_URL, PROD_BASE_URL],
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Authorization'
    })
  );

  app.use('/api/user', userRouter);
  app.use('/api/training', trainingRouter);
  app.use('/api/exercise', exerciseRouter);
  app.use('/api/friendship', friendShipRouter);

  app.use(errorHandler);
}

export async function start() {
  const app = express();
  await configureApp(app);
  await startDB(app);

  // Erstelle einen HTTP-Server, der sowohl von Express als auch von Socket.IO verwendet wird
  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
  });
}

start();
