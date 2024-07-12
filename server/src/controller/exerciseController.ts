import { Request, Response } from 'express';
import { MongoGenericDAO } from 'models/mongo-generic.dao.js';
import * as exerciseService from '../service/exerciseService.js';
import { User } from '@shared/models/user.js';
import { ApiData } from '@shared/models/apiData.js';
import { UserClaimsSet } from '../service/exerciseService.js';

export async function getExercises(req: Request, res: Response): Promise<void> {
  try {
    const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
    const userClaimsSet: UserClaimsSet = res.locals.user;

    const exercisesData = await exerciseService.getUserExercises(userDAO, userClaimsSet);
    res.status(200).json({ exercisesData });
  } catch (error) {
    res.status(404).json({ error: (error as unknown as Error).message });
  }
}

export async function updateExercises(req: Request, res: Response): Promise<void> {
  try {
    const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
    const userClaimsSet: UserClaimsSet = res.locals.user;
    const changedData: ApiData = req.body;

    await exerciseService.updateUserExercises(userDAO, userClaimsSet, changedData);
    res.status(200).json({ message: 'Erfolgreich aktualisiert.' });
  } catch (error) {
    console.error('An error occurred while updating user exercises', error);
    res.status(500).json({ message: 'Interner Serverfehler beim Aktualisieren der Benutzerübungen.' });
  }
}

export async function resetExercises(req: Request, res: Response): Promise<void> {
  try {
    const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
    const userClaimsSet: UserClaimsSet = res.locals.user;

    await exerciseService.resetUserExerciseData(userDAO, userClaimsSet);
    res.status(200).json({ message: 'Übungskatalog zurückgesetzt!' });
  } catch (error) {
    console.error('An error occurred while resetting user exercises', error);
    res.status(500).json({ message: 'Interner Serverfehler beim Zurücksetzen der Benutzerübungen.' });
  }
}
