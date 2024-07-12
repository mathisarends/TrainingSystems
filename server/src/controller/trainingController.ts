import { Request, Response } from 'express';
import { MongoGenericDAO } from 'models/mongo-generic.dao.js';
import * as trainingService from '../service/trainingService.js';
import { User } from '@shared/models/user.js';

export async function getPlans(req: Request, res: Response): Promise<void> {
  try {
    const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
    const userClaimsSet = res.locals.user;
    const trainingPlanDtos = await trainingService.getTrainingPlans(userDAO, userClaimsSet);
    res.status(200).json({ trainingPlanDtos });
  } catch (error) {
    res.status(404).json({ error: (error as unknown as Error).message });
  }
}

export async function createPlan(req: Request, res: Response): Promise<void> {
  try {
    const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
    const userClaimsSet = res.locals.user;
    const trainingPlanDtos = await trainingService.createTrainingPlan(userDAO, userClaimsSet, req.body);
    res.status(200).json({ trainingPlanDtos });
  } catch (error) {
    console.error('Es ist ein Fehler beim Erstellen des Trainingsplans aufgetreten', error);
    res.status(500).json({ error: (error as unknown as Error).message });
  }
}

export async function deletePlan(req: Request, res: Response): Promise<void> {
  try {
    const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
    const userClaimsSet = res.locals.user;
    await trainingService.deleteTrainingPlan(userDAO, userClaimsSet, req.params.planId);
    res.status(201).json({ message: 'Trainingsplan erfolgreich gelöscht' });
  } catch (error) {
    console.error('Es ist ein Fehler beim Löschen des Trainingsplans aufgetreten', error);
    res.status(500).json({ error: (error as unknown as Error).message });
  }
}

export async function getPlanForEdit(req: Request, res: Response): Promise<void> {
  try {
    const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
    const userClaimsSet = res.locals.user;
    const trainingPlanEditView = await trainingService.getTrainingPlanForEdit(userDAO, userClaimsSet, req.params.id);
    res.status(200).json({ trainingPlanEditView });
  } catch (error) {
    console.error('Es ist ein Fehler beim Editieren des Trainingsplans aufgetreten', error);
    res.status(500).json({ error: (error as unknown as Error).message });
  }
}

export async function updatePlan(req: Request, res: Response): Promise<void> {
  try {
    const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
    const userClaimsSet = res.locals.user;
    await trainingService.updateTrainingPlan(userDAO, userClaimsSet, req.params.id, req.body);
    res.status(200).json({ message: 'Trainingsplan erfolgreich aktualisiert' });
  } catch (error) {
    console.error('Es ist ein Fehler beim Aktualisieren des Trainingsplans aufgetreten', error);
    res.status(500).json({ error: (error as unknown as Error).message });
  }
}

export async function getPlanForDay(req: Request, res: Response): Promise<void> {
  try {
    const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
    const userClaimsSet = res.locals.user;
    const { id, week, day } = req.params;
    const trainingPlanForDay = await trainingService.getTrainingPlanForDay(
      userDAO,
      userClaimsSet,
      id,
      Number(week),
      Number(day)
    );
    res.status(200).json(trainingPlanForDay);
  } catch (error) {
    console.log('Es ist ein Fehler beim Aufrufen des Trainingsplans aufgetreten!', error);
    res.status(500).json({ error: (error as unknown as Error).message });
  }
}
