import { Request, Response } from 'express';
import * as userService from '../service/userService.js';
import { authService } from '../service/authService.js';

import dotenv from 'dotenv';
import { TrainingPlan } from '../models/training/trainingPlan.js';
import { TrainingDay } from '../models/training/trainingDay.js';
dotenv.config();

export async function register(req: Request, res: Response): Promise<void> {
  const userDAO = req.app.locals.userDAO;
  const user = await userService.registerUser(userDAO, req.body);
  authService.createAndSetToken({ id: user.id }, res);
  res.status(200).json({ message: 'Dein Account wurde erfolgreich erstellt' });
}

export async function login(req: Request, res: Response) {
  const userDAO = req.app.locals.userDAO;
  const user = await userService.loginUser(userDAO, req.body.email, req.body.password);
  if (!user) {
    authService.removeToken(res);
    return res.status(401).json({ error: 'Keine gültige Email und Passwort Kombination' });
  }
  authService.createAndSetToken({ id: user.id }, res);

  res.status(200).json({ message: 'Erfolgreich eingeloggt' });
}

export async function loginOAuth2(req: Request, res: Response): Promise<void> {
  const userDAO = req.app.locals.userDAO;
  const user = await userService.loginOAuth2User(userDAO, req.body.credential);
  authService.createAndSetToken({ id: user.id }, res);

  const redirectUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:4200?login=success'
      : 'https://trainingsystemsre.onrender.com?login=success';

  res.redirect(redirectUrl);
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  const user = await userService.getUser(req, res);
  const formattedCreatedAt = new Date(user.createdAt).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const userDto = {
    username: user.username,
    email: user.email,
    createdAt: formattedCreatedAt,
    pictureUrl: user.pictureUrl
  };

  res.status(200).json({ userDto });
}

/**
 * Retrieves the activity calendar for a user, calculating the tonnage (total weight lifted)
 * for each training day and returning a map of dates to tonnages.
 *
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @returns A Promise that resolves to void. Sends a JSON response with the activity map.
 */
export async function getActivityCalendar(req: Request, res: Response): Promise<void> {
  const user = await userService.getUser(req, res);

  const sortedTrainingPlans = sortTrainingPlans(user.trainingPlans);

  const activityMap = new Map<number, number>();

  for (const trainingPlan of sortedTrainingPlans) {
    for (const trainingWeek of trainingPlan.trainingWeeks) {
      for (const trainingDay of trainingWeek.trainingDays) {
        if (trainingDay.endTime) {
          const tonnagePerTrainingDay = getTonnagePerTrainingDay(trainingDay);

          const dayIndex = getIndexOfDayPerYearFromDate(trainingDay.endTime);

          activityMap.set(dayIndex, tonnagePerTrainingDay);
        }
      }
    }
  }

  const activityObject = Object.fromEntries(activityMap);

  res.status(200).json(activityObject);
}

/**
 * Retrieves training day notifications for a user.
 */
export async function getTrainingDayNotifications(req: Request, res: Response): Promise<Response> {
  const userDAO = req.app.locals.userDAO;

  const user = await userService.getUser(req, res);

  if (user.trainingDayNotifications === undefined) {
    user.trainingDayNotifications = [];

    await userDAO.update(user);
  }
  const trainingDayNotifications = user.trainingDayNotifications;

  // TODO: hier weiter am mock arbeiten
  /* const mockTrainingDay = user.trainingPlans[0].trainingWeeks[0].trainingDays[0];
  mockTrainingDay.durationInMinutes = 60;

  trainingDayNotifications.push(mockTrainingDay); */

  return res.status(200).json(trainingDayNotifications);
}

function getIndexOfDayPerYearFromDate(date: Date): number {
  const dateObj = new Date(date);

  const startOfYear = new Date(dateObj.getFullYear(), 0, 1);
  return Math.floor((dateObj.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Sorts an array of training plans by their 'lastUpdated' date in descending order.
 *
 * @param trainingPlans - An array of TrainingPlan objects to be sorted.
 * @returns An array of TrainingPlan objects sorted by the 'lastUpdated' date in descending order.
 */
function sortTrainingPlans(trainingPlans: TrainingPlan[]): TrainingPlan[] {
  return trainingPlans.sort((a, b) => {
    const dateA = new Date(a.lastUpdated).getTime();
    const dateB = new Date(b.lastUpdated).getTime();
    return dateB - dateA;
  });
}

/**
 * Calculates the total tonnage (weight lifted) for a given training day.
 *
 * @param trainingDay - A TrainingDay object containing the exercises for that day.
 * @returns The total tonnage for the training day.
 */
function getTonnagePerTrainingDay(trainingDay: TrainingDay): number {
  let tonnage = 0;
  for (const exercise of trainingDay.exercises) {
    const weight = Number(exercise.weight);

    if (isNaN(weight)) {
      continue;
    }

    const tonnagePerExercise = weight * exercise.sets * exercise.reps;
    tonnage += tonnagePerExercise;
  }

  return tonnage;
}

export async function updateProfilePicture(req: Request, res: Response): Promise<Response> {
  const userDAO = req.app.locals.userDAO;
  const user = await userService.getUser(req, res);
  const profilePicture = req.body.profilePicture;

  if (!profilePicture) {
    return res.status(404).json({ error: 'Profile picture not found in request body' });
  }

  user.pictureUrl = profilePicture;
  await userDAO.update(user);

  return res.status(200).json({ message: 'Dein Profilbild wurde erfolgreich geupdated' });
}

export function signOut(req: Request, res: Response): void {
  authService.removeToken(res);
  res.status(200).json({ message: 'Token erfolgreich entfernt' });
}
