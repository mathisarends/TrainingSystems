import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'node:http';
import config from '../config.json' assert { type: 'json' };
import startDB from './db.js';

async function configureApp(app: Express) {
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(cors());

  app.get('/', (req, res) => {
    res.json({ message: 'Hallo ich bin die Welt' });
  });
}

export async function start() {
  const app = express();
  await configureApp(app);
  await startDB(app);
  startHttpServer(app, config.server.port);
}

async function startHttpServer(app: Express, port: number) {
  const httpServer = http.createServer(app);
  httpServer.listen(port, () => {
    app.locals.port = port;
    console.log(`Server running at http://localhost:${port}`);
  });
}

start();
