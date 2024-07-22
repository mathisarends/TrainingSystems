import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import startDB from './db.js';

import cors from 'cors';

// Routers
import userRouter from './routes/userRoutes.js';
import trainingRouter from './routes/trainingRoutes.js';
import exerciseRouter from './routes/exerciseRoutes.js';
import friendShipRouter from './routes/friendshipRoutes.js';
import session from 'express-session';
dotenv.config();

const PORT = process.env.port ? parseInt(process.env.port, 10) : 3000;

async function configureApp(app: Express) {
  app.use(session({ secret: process.env.jwt_secret!, resave: false, saveUninitialized: true }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());

  app.use(
    cors({
      origin: 'http://localhost:4200',
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Authorization'
    })
  );

  /*   app.use((req, res, next) => {
    const userAgent = req.headers['user-agent'];
    console.log('🚀 ~ app.use ~ userAgent:', userAgent);
    const referer = req.headers['referer'];
    console.log('🚀 ~ app.use ~ referer:', referer);

    if (userAgent && userAgent.includes('node')) {
      res.status(403).send('Forbidden');
    } else {
      next();
    }
  }) */ app.use('/user', userRouter);
  app.use('/training', trainingRouter);
  app.use('/exercise', exerciseRouter);
  app.use('/friendship', friendShipRouter);
}
export async function start() {
  const app = express();
  await configureApp(app);
  await startDB(app);

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

start();
