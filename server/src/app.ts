import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express } from 'express';
import helmet from 'helmet';
import http from 'http';
import webPush from 'web-push';
import limiter from './config/rate-limiter.js';
import emailTestRouter from './controller/emailTestRouter.js';
import startDB from './db.js';
import { errorHandler } from './middleware/error-handler.js';
import requestLogger from './middleware/request-middleware.js';
import exerciseRouter from './routes/exerciseRoutes.js';
import friendShipRouter from './routes/friendshipRoutes.js';
import pushNotificationRouter from './routes/pushNotificationRoutes.js';
import trainingRouter from './routes/training/trainingRoutes.js';
import trainingSessionRouter from './routes/trainingSession/trainingSessionRouter.js';
import userRouter from './routes/user/userRoutes.js';
import webSocketService from './service/webSocketService.js';

dotenv.config();

const PORT = process.env.port ? parseInt(process.env.port, 10) : 3000;

const DEV_BASE_URL = process.env.DEV_BASE_URL!;
const PROD_BASE_URL = process.env.PROD_BASE_URL!;

webPush.setVapidDetails(
  `mailto:${process.env.contact_email}`,
  process.env.vapid_public_key!,
  process.env.vapid_secret_key!
);

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

  app.use(requestLogger);

  app.use(helmet());

  app.use('/api/', limiter);
  app.use('/api/user', userRouter);
  app.use('/api/training', trainingRouter);
  app.use('/api/training-session', trainingSessionRouter);
  app.use('/api/exercise', exerciseRouter);
  app.use('/api/friendship', friendShipRouter);
  app.use('/api/push-notifications', pushNotificationRouter);
  app.use('/api/test', emailTestRouter);

  app.use(errorHandler);
}

export async function start() {
  const app = express();
  await configureApp(app);
  await startDB(app);

  // Erstelle einen HTTP-Server, der sowohl von Express als auch von Socket.IO verwendet wird
  const server = http.createServer(app);
  webSocketService.initialize(server);

  server.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
  });
}

start();
