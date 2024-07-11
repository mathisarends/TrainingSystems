import express from 'express';
import { MongoGenericDAO } from '../models/mongo-generic.dao.js';
import { User } from '../models/user.js';

import { authService } from '../service/authService.js';
import { BasicTrainingPlanView, TrainingPlanDTO } from '../dto/trainingDto.js';

import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Darstellung auf der Trainings index page
router.get('/plans', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;

  const userClaimsSet = res.locals.user;

  const user = await userDAO.findOne({ id: userClaimsSet.id });
  if (!user) {
    return res.status(404).json({ error: 'Benutzer nicht gefunden' });
  }

  const trainingPlanDtos: BasicTrainingPlanView[] = [];

  for (const trainingPlan of user.trainingPlans) {
    trainingPlanDtos.push(TrainingPlanDTO.getBasicView(trainingPlan));
  }

  res.status(200).json({ trainingPlanDtos });
});

export default router;
