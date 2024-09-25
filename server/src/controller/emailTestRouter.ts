import { Router } from 'express';
import { generateTrainingSummaryEmail } from './training/training-summary/training-day-summary.js';
import { TrainingSummary } from './training/training-summary/training-summary.js';

const emailTestRouter = Router();

emailTestRouter.get('/', (req, res) => {
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

export default emailTestRouter;
