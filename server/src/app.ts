import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import http from 'node:http';
import dotenv from 'dotenv';
import startDB from './db.js';

import cors from 'cors';

// Routers
import userRouter from './routes/userRoutes.js';
import trainingRouter from './routes/trainingRoutes.js';
import exerciseRouter from './routes/exerciseRoutes.js';
dotenv.config();

const PORT = process.env.port ? parseInt(process.env.port, 10) : 3000;

async function configureApp(app: Express) {
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.use(
    cors({
      origin: 'http://localhost:4200',
      credentials: true
    })
  );

  app.use('/user', userRouter);
  app.use('/training', trainingRouter);
  app.use('/exercise', exerciseRouter);
}

export async function start() {
  const app = express();
  await configureApp(app);
  await startDB(app);
  startHttpServer(app, PORT);
}

async function startHttpServer(app: Express, port: number) {
  const httpServer = http.createServer(app);
  httpServer.listen(port, () => {
    app.locals.port = port;
    console.log(`Server running at http://localhost:${port}`);
  });
}

start();
