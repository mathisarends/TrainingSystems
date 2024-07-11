import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'node:http';
import dotenv from 'dotenv';
import startDB from './db.js';

// Routers
import userRouter from './routes/user.js';
import trainingRouter from './routes/training.js';
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

  app.get('/', (req, res) => {
    res.json({ message: 'Hallo ich bin die Welt' });
  });
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
