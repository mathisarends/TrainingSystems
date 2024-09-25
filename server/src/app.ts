import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express, { Express } from 'express';
import http from 'http';
import startDB from './db.js';

import cors from 'cors';

// Routers
import { generateTrainingSummaryEmail } from './controller/training/training-summary/training-day-summary.js';
import { TrainingSummary } from './controller/training/training-summary/training-summary.js';
import { errorHandler } from './middleware/error-handler.js';
import exerciseRouter from './routes/exerciseRoutes.js';
import friendShipRouter from './routes/friendshipRoutes.js';
import trainingRouter from './routes/training/trainingRoutes.js';
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

  app.get('/', (req, res) => {
    const trainingSummaryData: TrainingSummary = {
      id: '123123',
      trainingDayWeekNumber: 2,
      trainingDayDayNumber: 3,
      trainingPlanTitle: 'Strength Training',
      startTime: new Date(),
      endTime: new Date(),
      durationInMinutes: 75,
      trainingDayTonnage: 1200,
      exercises: [
        {
          exercise: 'Bench Press',
          category: 'Strength',
          sets: 4,
          reps: 8,
          weight: '80',
          targetRPE: '7',
          actualRPE: '8',
          estMax: 95
        },
        {
          exercise: 'Squat',
          category: 'Strength',
          sets: 5,
          reps: 5,
          weight: '80',
          targetRPE: '7',
          actualRPE: '8',
          estMax: 150
        },
        {
          exercise: 'Deadlift',
          category: 'Strength',
          sets: 3,
          reps: 5,
          weight: '80',
          targetRPE: '7',
          actualRPE: '8',
          estMax: 160
        }
      ]
    };

    const htmlContent = generateTrainingSummaryEmail(trainingSummaryData);
    res.send(htmlContent);
  });

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
